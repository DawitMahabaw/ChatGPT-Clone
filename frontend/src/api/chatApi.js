// The api folder contains code responsible for communicating with our backend.
import axios from "axios";

// All API requests start with /api.
// const API_URL = "/api";

// Deployed backend API URL.
const API_URL = "https://ethiomovieclone-backend.vercel.app/api";

// Send the user's question to the backend.
export const sendMessage = async (question) => {
  try {
    const response = await axios.post(`${API_URL}/chat/conversations`, {
      question,
    });

    return response.data;
  } catch (error) {
    console.error("API error:", error.message);

    throw new Error(
      error.response?.data?.error || "Unable to communicate with the server.",
    );
  }
};

// Get previous conversations from the backend.
export const getConversations = async () => {
  try {
    const response = await axios.get(`${API_URL}/chat/conversations`);

    return response.data;
  } catch (error) {
    console.error("API error:", error.message);

    throw new Error(
      error.response?.data?.error || "Unable to load conversations.",
    );
  }
};