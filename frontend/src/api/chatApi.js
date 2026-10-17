import apiClient from "./apiClient";

/**
 * Retrieve all chat sessions for the active user.
 */
export const getChatSessions = async () => {
  try {
    const response = await apiClient.get("/api/chat/sessions");
    return response.data;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw new Error(
      error.response?.data?.error || "Unable to load chat sessions.",
    );
  }
};

/**
 * Explicitly create a new blank chat session.
 */
export const createNewChatSession = async (title = "New chat") => {
  try {
    const response = await apiClient.post("/api/chat/sessions", { title });
    return response.data;
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error(
      error.response?.data?.error || "Unable to create new chat session.",
    );
  }
};

/**
 * Retrieve messages for a specific chat session thread.
 */
export const getSessionMessages = async (sessionId) => {
  try {
    const response = await apiClient.get(`/api/chat/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching session messages:", error);
    throw new Error(
      error.response?.data?.error || "Unable to load messages for this chat.",
    );
  }
};

/**
 * Rename a chat session title.
 */
export const renameChatSession = async (sessionId, title) => {
  try {
    const response = await apiClient.put(`/api/chat/sessions/${sessionId}`, {
      title,
    });
    return response.data;
  } catch (error) {
    console.error("Error renaming chat session:", error);
    throw new Error(
      error.response?.data?.error || "Unable to rename chat session.",
    );
  }
};

/**
 * Delete a chat session.
 */
export const deleteChatSession = async (sessionId) => {
  try {
    const response = await apiClient.delete(`/api/chat/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting chat session:", error);
    throw new Error(
      error.response?.data?.error || "Unable to delete chat session.",
    );
  }
};

/**
 * Send the user's question to the backend. A session ID is sent only for a
 * saved, authenticated chat. Guest history stays in the browser.
 */
export const sendMessage = async (
  question,
  sessionId = null,
  history = [],
) => {
  try {
    const response = await apiClient.post("/api/chat/conversations", {
      question,
      sessionId,
      history,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error.message);
    throw new Error(
      error.response?.data?.error || "Unable to communicate with the server.",
    );
  }
};

/**
 * Get recent conversations (legacy/backward compatibility).
 */
export const getConversations = async (sessionId = null) => {
  try {
    const url = sessionId
      ? `/api/chat/conversations?sessionId=${sessionId}`
      : "/api/chat/conversations";
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("API error:", error.message);
    throw new Error(
      error.response?.data?.error || "Unable to load conversations.",
    );
  }
};
