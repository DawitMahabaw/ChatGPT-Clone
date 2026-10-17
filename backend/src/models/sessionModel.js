import dbConnection from "../config/database.js";

/**
 * Get all chat sessions belonging to a specific user (or guest sessions).
 */
export const getUserSessions = async (userId = null) => {
  let query;
  let params;

  if (userId) {
    query = `
      SELECT id, user_id, title, model, created_at, updated_at
      FROM sessions
      WHERE user_id = ?
      ORDER BY updated_at DESC, created_at DESC
    `;
    params = [userId];
  } else {
    query = `
      SELECT id, user_id, title, model, created_at, updated_at
      FROM sessions
      WHERE user_id IS NULL
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 20
    `;
    params = [];
  }

  const [rows] = await dbConnection.execute(query, params);
  return rows;
};

/**
 * Get a specific session by ID.
 */
export const getSessionById = async (sessionId, userId = null) => {
  let query = `
    SELECT id, user_id, title, model, created_at, updated_at
    FROM sessions
    WHERE id = ?
  `;
  const params = [sessionId];

  if (userId) {
    query += " AND (user_id = ? OR user_id IS NULL)";
    params.push(userId);
  }

  const [rows] = await dbConnection.execute(query, params);
  return rows[0] || null;
};

/**
 * Create a new chat session.
 */
export const createSession = async ({
  id,
  userId = null,
  title = "New chat",
  model = "gemini-3.5-flash-lite",
}) => {
  await dbConnection.execute(
    `INSERT INTO sessions (id, user_id, title, model)
     VALUES (?, ?, ?, ?)`,
    [id, userId, title, model],
  );

  return { id, userId, title, model };
};

/**
 * Update the title of an existing chat session (Rename feature).
 */
export const updateSessionTitle = async (sessionId, title, userId = null) => {
  let query = `
    UPDATE sessions
    SET title = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const params = [title.trim(), sessionId];

  if (userId) {
    query += " AND (user_id = ? OR user_id IS NULL)";
    params.push(userId);
  }

  const [result] = await dbConnection.execute(query, params);
  return result.affectedRows > 0;
};

/**
 * Update the session's timestamp to now when a new message is added.
 */
export const touchSession = async (sessionId) => {
  await dbConnection.execute(
    `UPDATE sessions
     SET updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [sessionId],
  );
};

/**
 * Delete a chat session and all messages linked to it.
 */
export const deleteSession = async (sessionId, userId = null) => {
  let query = "DELETE FROM sessions WHERE id = ?";
  const params = [sessionId];

  if (userId) {
    query += " AND (user_id = ? OR user_id IS NULL)";
    params.push(userId);
  }

  const [result] = await dbConnection.execute(query, params);

  if (result.affectedRows > 0) {
    // Also delete messages associated with this session
    await dbConnection.execute(
      "DELETE FROM conversations WHERE session_id = ?",
      [sessionId],
    );
    return true;
  }

  return false;
};
