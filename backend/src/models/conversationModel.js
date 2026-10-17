import dbConnection from "../config/database.js";

/**
 * Get all messages belonging to a specific session in chronological order.
 */
export const getSessionConversations = async (sessionId, userId) => {
  const [rows] = await dbConnection.execute(
    `SELECT conversations.id, conversations.session_id, conversations.role,
            conversations.content, conversations.token_count,
            conversations.created_at
     FROM conversations
     INNER JOIN sessions ON sessions.id = conversations.session_id
     WHERE conversations.session_id = ? AND sessions.user_id = ?
     ORDER BY conversations.id ASC`,
    [sessionId, userId],
  );

  return rows;
};

/**
 * Get recent messages for a session to provide context memory to Gemini.
 */
export const getRecentContextMessages = async (
  sessionId,
  userId,
  limit = 10,
) => {
  const safeLimit = Number.parseInt(limit, 10) || 10;

  const [rows] = await dbConnection.execute(
    `SELECT conversations.role, conversations.content
     FROM conversations
     INNER JOIN sessions ON sessions.id = conversations.session_id
     WHERE conversations.session_id = ? AND sessions.user_id = ?
     ORDER BY conversations.id DESC
     LIMIT ${safeLimit}`,
    [sessionId, userId],
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
  sessionId,
) => {
  const [result] = await dbConnection.execute(
    `INSERT INTO conversations
      (session_id, role, content, token_count)
     VALUES (?, ?, ?, ?)`,
    [sessionId, role, content, tokenCount],
  );

  return result.insertId;
};
