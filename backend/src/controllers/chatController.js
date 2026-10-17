import { randomUUID } from "node:crypto";
import {
  getSessionConversations,
  getRecentContextMessages,
  createConversation,
} from "../models/conversationModel.js";
import {
  getUserSessions,
  getSessionById,
  createSession,
  updateSessionTitle as updateSessionTitleInDb,
  deleteSession as deleteSessionFromDb,
  touchSession,
} from "../models/sessionModel.js";
import { generateAssistantResponse } from "../services/geminiService.js";

/**
 * Health check endpoint.
 */
export const healthCheck = (req, res) => {
  res.json({
    message: "ChatGPT Clone backend is running",
  });
};

/**
 * Get all saved chat sessions for the authenticated user.
 */
export const getSessions = async (req, res) => {
  try {
    const sessions = await getUserSessions(req.user.id);

    res.json(sessions);
  } catch (error) {
    console.error("Error getting sessions:", error.message);
    res.status(500).json({
      error: "Failed to retrieve chat sessions",
    });
  }
};

/**
 * Explicitly create a new blank chat session.
 */
export const createNewSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title = "New chat", model = "gemini-3.5-flash-lite" } = req.body;

    if (typeof title !== "string" || title.trim().length > 255) {
      return res.status(400).json({
        error: "Chat title must be 1 to 255 characters.",
      });
    }

    const sessionId = `chat_${randomUUID()}`;

    const newSession = await createSession({
      id: sessionId,
      userId,
      title: title.trim() || "New chat",
      model,
    });

    res.status(201).json(newSession);
  } catch (error) {
    console.error("Error creating session:", error.message);
    res.status(500).json({
      error: "Failed to create new chat session",
    });
  }
};

/**
 * Get all messages inside a specific session thread.
 */
export const getSessionMessages = async (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const userId = req.user.id;

    const session = await getSessionById(sessionId, userId);
    if (!session) {
      return res.status(404).json({
        error: "Chat session not found",
      });
    }

    const messages = await getSessionConversations(sessionId, userId);

    res.json({
      session,
      messages,
    });
  } catch (error) {
    console.error("Error getting session messages:", error.message);
    res.status(500).json({
      error: "Failed to get session messages",
    });
  }
};

/**
 * Rename a chat session title.
 */
export const updateSessionTitle = async (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 255
    ) {
      return res.status(400).json({
        error: "Chat title must be 1 to 255 characters.",
      });
    }

    const updated = await updateSessionTitleInDb(sessionId, title.trim(), userId);
    if (!updated) {
      return res.status(404).json({
        error: "Chat session not found or unauthorized",
      });
    }

    res.json({
      success: true,
      id: sessionId,
      title: title.trim(),
    });
  } catch (error) {
    console.error("Error updating session title:", error.message);
    res.status(500).json({
      error: "Failed to update chat title",
    });
  }
};

/**
 * Delete a specific chat session and all its messages.
 */
export const deleteSession = async (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const userId = req.user.id;

    const deleted = await deleteSessionFromDb(sessionId, userId);
    if (!deleted) {
      return res.status(404).json({
        error: "Chat session not found or unauthorized",
      });
    }

    res.json({
      success: true,
      message: "Chat session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting session:", error.message);
    res.status(500).json({
      error: "Failed to delete chat session",
    });
  }
};

/**
 * Backward-compatible endpoint to get messages from one owned chat session.
 */
export const getConversations = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        error: "A chat session ID is required.",
      });
    }

    const session = await getSessionById(sessionId, req.user.id);
    if (!session) {
      return res.status(404).json({ error: "Chat session not found." });
    }

    const conversations = await getSessionConversations(sessionId, req.user.id);
    res.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error.message);
    res.status(500).json({
      error: "Failed to get conversations",
    });
  }
};

/**
 * Handles sending a message within a chat session, getting an AI response with context memory,
 * and automatically creating/naming the chat if starting a new one.
 *
 * Guests can use the assistant, but their messages are never written to the
 * database. Only a verified account receives a session and saved history.
 */
export const createConversationMessage = async (req, res) => {
  try {
    const { question, history: guestHistory } = req.body;
    let { sessionId } = req.body;
    const userId = req.user?.id;

    // Validate prompt
    if (
      typeof question !== "string" ||
      !question.trim() ||
      question.trim().length > 10000
    ) {
      return res.status(400).json({
        error: "Question must be between 1 and 10,000 characters.",
      });
    }

    if (
      sessionId !== undefined &&
      sessionId !== null &&
      typeof sessionId !== "string"
    ) {
      return res.status(400).json({ error: "Invalid chat session ID." });
    }

    const cleanQuestion = question.trim();

    if (!userId) {
      // Keep a small, client-provided in-memory context for the current guest
      // tab only. It is intentionally not stored or listed anywhere.
      const history = Array.isArray(guestHistory)
        ? guestHistory
            .filter(
              (message) =>
                message &&
                (message.role === "user" || message.role === "assistant") &&
                typeof message.content === "string" &&
                message.content.trim(),
            )
            .slice(-8)
            .map(({ role, content }) => ({
              role,
              content: content.trim().slice(0, 10000),
            }))
        : [];

      const { text } = await generateAssistantResponse(cleanQuestion, history);

      return res.status(201).json({
        answer: text,
        sessionId: null,
        sessionTitle: null,
        isNewSession: false,
        saved: false,
      });
    }

    let isNewSession = false;
    let sessionTitle = "New chat";

    // A missing ID starts a new private chat. A supplied ID must belong to the
    // logged-in user; it is never repurposed into a different user's session.
    if (!sessionId) {
      sessionId = `chat_${randomUUID()}`;
      isNewSession = true;
    }

    let existingSession = await getSessionById(sessionId, userId);
    if (!existingSession) {
      if (!isNewSession) {
        return res.status(404).json({
          error: "Chat session not found.",
        });
      }

      // Auto-generate title from first 35 chars of user's question
      const cleanTitle = cleanQuestion.replace(/[\r\n]+/g, " ");
      sessionTitle =
        cleanTitle.length > 35
          ? `${cleanTitle.substring(0, 35)}...`
          : cleanTitle;

      existingSession = await createSession({
        id: sessionId,
        userId,
        title: sessionTitle,
      });
      isNewSession = true;
    } else {
      sessionTitle = existingSession.title;
      // If title is default 'New chat', update it with user's first prompt
      if (sessionTitle === "New chat") {
        const cleanTitle = cleanQuestion.replace(/[\r\n]+/g, " ");
        sessionTitle =
          cleanTitle.length > 35
            ? `${cleanTitle.substring(0, 35)}...`
            : cleanTitle;
        await updateSessionTitleInDb(sessionId, sessionTitle, userId);
      }
    }

    // Retrieve previous conversational turns to provide context memory to Gemini
    const history = await getRecentContextMessages(sessionId, userId, 8);

    // Save the user's message tied to this session
    const userConversationId = await createConversation(
      "user",
      cleanQuestion,
      0,
      sessionId,
    );

    // Generate answer with conversational context
    const { text, totalTokens } = await generateAssistantResponse(
      cleanQuestion,
      history,
    );

    // Save Gemini's answer tied to this session
    const assistantConversationId = await createConversation(
      "assistant",
      text,
      totalTokens,
      sessionId,
    );

    // Update the session updated_at timestamp
    await touchSession(sessionId, userId);

    // Send response back
    res.status(201).json({
      userConversationId,
      assistantConversationId,
      answer: text,
      sessionId,
      sessionTitle,
      isNewSession,
      saved: true,
    });
  } catch (error) {
    console.error("Error creating conversation:", error.message);
    res.status(500).json({
      error: "Failed to create conversation",
    });
  }
};
