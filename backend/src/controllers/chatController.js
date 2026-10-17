import { randomUUID } from "node:crypto";
import {
  getRecentConversations,
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
 * Get all chat sessions for the authenticated user (or recent guest sessions).
 */
export const getSessions = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessions = await getUserSessions(userId);

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
    const userId = req.user?.id || null;
    const { title = "New chat", model = "gemini-3.5-flash-lite" } = req.body;
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
    const userId = req.user?.id || null;

    const session = await getSessionById(sessionId, userId);
    if (!session) {
      return res.status(404).json({
        error: "Chat session not found",
      });
    }

    const messages = await getSessionConversations(sessionId);

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
    const userId = req.user?.id || null;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Chat title cannot be empty",
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
    const userId = req.user?.id || null;

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
 * Backward-compatible endpoint to get recent conversations.
 */
export const getConversations = async (req, res) => {
  try {
    const { sessionId, limit } = req.query;

    if (sessionId) {
      const messages = await getSessionConversations(sessionId);
      return res.json(messages);
    }

    const conversations = await getRecentConversations(limit || 20);
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
 */
export const createConversationMessage = async (req, res) => {
  try {
    const { question } = req.body;
    let { sessionId } = req.body;
    const userId = req.user?.id || null;

    // Validate prompt
    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Question is required",
      });
    }

    let isNewSession = false;
    let sessionTitle = "New chat";

    // If no sessionId passed, or if session does not exist, create a new session
    if (!sessionId) {
      sessionId = `chat_${randomUUID()}`;
      isNewSession = true;
    }

    let existingSession = await getSessionById(sessionId, userId);
    if (!existingSession) {
      // Auto-generate title from first 35 chars of user's question
      const cleanTitle = question.trim().replace(/[\r\n]+/g, " ");
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
        const cleanTitle = question.trim().replace(/[\r\n]+/g, " ");
        sessionTitle =
          cleanTitle.length > 35
            ? `${cleanTitle.substring(0, 35)}...`
            : cleanTitle;
        await updateSessionTitleInDb(sessionId, sessionTitle, userId);
      }
    }

    // Retrieve previous conversational turns to provide context memory to Gemini
    const history = await getRecentContextMessages(sessionId, 8);

    // Save the user's message tied to this session
    const userConversationId = await createConversation(
      "user",
      question,
      0,
      sessionId,
    );

    // Generate answer with conversational context
    const { text, totalTokens } = await generateAssistantResponse(
      question,
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
    await touchSession(sessionId);

    // Send response back
    res.status(201).json({
      userConversationId,
      assistantConversationId,
      answer: text,
      sessionId,
      sessionTitle,
      isNewSession,
    });
  } catch (error) {
    console.error("Error creating conversation:", error.message);
    res.status(500).json({
      error: "Failed to create conversation",
    });
  }
};