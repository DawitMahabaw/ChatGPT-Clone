import {
  getRecentConversations,
  createConversation,
} from "../models/conversationModel.js";

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


// Handles creating a new user conversation.
export const createConversationMessage = async (req, res) => {
  try {
    const { question } = req.body;

    // Make sure the user actually sent a question.
    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Question is required",
      });
    }

    // Save the user's question in the database.
    const conversationId = await createConversation(
      "user",
      question
    );

    res.status(201).json({
      message: "Question saved successfully",
      conversationId,
    });
  } catch (error) {
    console.error("Error creating conversation:", error.message);

    res.status(500).json({
      error: "Failed to save conversation",
    });
  }
};
