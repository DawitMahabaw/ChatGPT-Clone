import {
  getRecentConversations,
  createConversation,
} from "../models/conversationModel.js";
import { generateAssistantResponse } from "../services/geminiService.js";

// Handles requests for recent conversations.
export const getConversations = async (req, res) => {
  try {
    const conversations = await getRecentConversations();

    res.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error.message);

    res.status(500).json({
      error: "Failed to get conversations",
    });
  }
};

// Simple test for our backend.
export const healthCheck = (req, res) => {
  res.json({
    message: "ChatGPT Clone backend is running",
  });
};



// Handles a user's question and gets an answer from Gemini.
export const createConversationMessage = async (req, res) => {
  try {
    const { question } = req.body;

    // Make sure a question was provided.
    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Question is required",
      });
    }

    // Save the user's question first.
    const userConversationId = await createConversation(
      "user",
      question
    );

    // Ask Gemini for an answer.
    const { text, totalTokens } =
      await generateAssistantResponse(question);

    // Save Gemini's answer.
    const assistantConversationId = await createConversation(
      "assistant",
      text,
      totalTokens
    );

    // Send both messages back to the frontend.
    res.status(201).json({
      userConversationId,
      assistantConversationId,
      answer: text,
    });
  } catch (error) {
    console.error("Error creating conversation:", error.message);

    res.status(500).json({
      error: "Failed to create conversation",
    });
  }
};