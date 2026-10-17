import dbConnection from "../config/database.js";

// Find a user by their email address
export const findUserByEmail = async (email) => {
  const [rows] = await dbConnection.execute(
    `SELECT id, username, email, password, created_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email.toLowerCase().trim()],
  );

  return rows[0] || null;
};

// Find a user by their unique ID
export const findUserById = async (id) => {
  const [rows] = await dbConnection.execute(
    `SELECT id, username, email, created_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] || null;
};

// Create a new user with hashed password
export const createUser = async ({ username, email, password }) => {
  const [result] = await dbConnection.execute(
    `INSERT INTO users (username, email, password)
     VALUES (?, ?, ?)`,
    [username.trim(), email.toLowerCase().trim(), password],
  );

  return result.insertId;
};
