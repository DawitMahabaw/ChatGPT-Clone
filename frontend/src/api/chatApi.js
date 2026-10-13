// The api folder contains code responsible for communicating with our backend.
import axios from "axios";

// All API requests use the backend's /api prefix.
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://chatgpt-clone-71v0.onrender.com";

// Send the user's question to the backend.
export const sendMessage = async (question) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/chat/conversations`,
      { question },
    );

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
    const response = await axios.get(
      `${API_URL}/api/chat/conversations`,
    );

    return response.data;
  } catch (error) {
    console.error("API error:", error.message);

    throw new Error(
      error.response?.data?.error || "Unable to load conversations.",
    );
  }
};