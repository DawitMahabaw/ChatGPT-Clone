import dbConnection from "../config/database.js";

// Get recent conversations from the database.
export const getRecentConversations = async (limit = 5) => {
  const [rows] = await dbConnection.execute(
    `SELECT id, role, content, created_at
     FROM conversations
     ORDER BY id DESC
     LIMIT ${limit}`,
  );

  // The database returns newest first.
  // Reverse them so the oldest message comes first.
  return rows.reverse();
};

// Save a new conversation message.
export const createConversation = async (role, content, tokenCount = 0) => {
  const [result] = await dbConnection.execute(
    `INSERT INTO conversations
      (role, content, token_count)
     VALUES (?, ?, ?)`,
    [role, content, tokenCount],
  );

  return result.insertId;
};
