// The api folder contains code responsible for communicating with our backend.

import axios from "axios";

// Base address of our backend API.
// We will configure the Vite proxy later.
const API_URL = "/api";

// Send a new question to the backend.
export const sendMessage = async (question) => {
  const response = await axios.post(`${API_URL}/chat/conversations`, {
    question,
  });

  return response.data;
};