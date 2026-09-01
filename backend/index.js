import "dotenv/config";
import express from "express";
import chatRoutes from "./src/routes/chatRoutes.js";
import dbConnection from "./src/config/database.js";

const app = express();

const PORT = 4000;

// Allows Express to read JSON request bodies.
app.use(express.json());

// Test the database connection.
const testDatabaseConnection = async () => {
  try {
    const connection = await dbConnection.getConnection();

    console.log("MySQL database connected successfully");

    connection.release();
  } catch (error) {
    console.error("MySQL database connection failed:", error.message);
  }
};

testDatabaseConnection();

// Chat routes.
app.use("/api/chat", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
