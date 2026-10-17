import dbConnection from "../config/database.js";

/**
 * Get all messages belonging to a specific session in chronological order.
 */
export const getSessionConversations = async (sessionId) => {
  const [rows] = await dbConnection.execute(
    `SELECT id, session_id, role, content, token_count, created_at
     FROM conversations
     WHERE session_id = ?
     ORDER BY id ASC`,
    [sessionId],
  );

  return rows;
};

/**
 * Get recent conversations across sessions (backward compatible).
 */
export const getRecentConversations = async (limit = 20) => {
  const safeLimit = Number.parseInt(limit, 10) || 20;

  const [rows] = await dbConnection.execute(
    `SELECT id, session_id, role, content, created_at
     FROM conversations
     ORDER BY id DESC
     LIMIT ${safeLimit}`,
  );

  // Show the oldest message first.
  return rows.reverse();
};

/**
 * Get recent messages for a session to provide context memory to Gemini.
 */
export const getRecentContextMessages = async (sessionId, limit = 10) => {
  const safeLimit = Number.parseInt(limit, 10) || 10;

  const [rows] = await dbConnection.execute(
    `SELECT role, content
     FROM conversations
     WHERE session_id = ?
     ORDER BY id DESC
     LIMIT ${safeLimit}`,
    [sessionId],
  );

  return rows.reverse();
};

/**
 * Save a new conversation message linked to a session.
 */
export const createConversation = async (
  role,
  content,
  tokenCount = 0,
  sessionId = "default",
) => {
  const [result] = await dbConnection.execute(
    `INSERT INTO conversations
      (session_id, role, content, token_count)
     VALUES (?, ?, ?, ?)`,
    [sessionId, role, content, tokenCount],
  );

  return result.insertId;
};
