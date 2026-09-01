import { getRecentConversations } from "../models/conversationModel.js";

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
