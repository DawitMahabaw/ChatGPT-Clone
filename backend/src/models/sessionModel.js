import dbConnection from "../config/database.js";

/**
 * Get the saved chat sessions for one authenticated user.
 *
 * Sessions are deliberately never shared with guests or other accounts.
 */
export const getUserSessions = async (userId) => {
  const [rows] = await dbConnection.execute(
    `SELECT id, user_id, title, model, created_at, updated_at
     FROM sessions
     WHERE user_id = ?
     ORDER BY updated_at DESC, created_at DESC`,
    [userId],
  );

  return rows;
};

/**
 * Get one session only when it belongs to the requesting user.
 */
export const getSessionById = async (sessionId, userId) => {
  const [rows] = await dbConnection.execute(
    `
    SELECT id, user_id, title, model, created_at, updated_at
    FROM sessions
    WHERE id = ? AND user_id = ?
    LIMIT 1`,
    [sessionId, userId],
  );

  return rows[0] || null;
};

/**
 * Create a new chat session.
 */
export const createSession = async ({
  id,
  userId,
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
export const updateSessionTitle = async (sessionId, title, userId) => {
  const [result] = await dbConnection.execute(
    `
    UPDATE sessions
    SET title = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?`,
    [title.trim(), sessionId, userId],
  );

  return result.affectedRows > 0;
};

/**
 * Update the session's timestamp to now when a new message is added.
 */
export const touchSession = async (sessionId, userId) => {
  await dbConnection.execute(
    `UPDATE sessions
     SET updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [sessionId, userId],
  );
};

/**
 * Delete a chat session and all messages linked to it.
 */
export const deleteSession = async (sessionId, userId) => {
  const connection = await dbConnection.getConnection();

  try {
    await connection.beginTransaction();

    const [sessions] = await connection.execute(
      "SELECT id FROM sessions WHERE id = ? AND user_id = ? FOR UPDATE",
      [sessionId, userId],
    );

    if (sessions.length === 0) {
      await connection.rollback();
      return false;
    }

    await connection.execute(
      "DELETE FROM conversations WHERE session_id = ?",
      [sessionId],
    );

    const [result] = await connection.execute(
      "DELETE FROM sessions WHERE id = ? AND user_id = ?",
      [sessionId, userId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Session ownership changed while deleting the chat.");
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
