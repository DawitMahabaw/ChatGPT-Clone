import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRoutes from "./src/routes/chatRoutes.js";
import dbConnection from "./src/config/database.js";

const app = express();

// Allow the frontend to communicate with the backend.
app.use(cors());

// Allows Express to read JSON request bodies.
app.use(express.json());

// Chat routes.
app.use("/api/chat", chatRoutes);

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

// Test the database when the application starts.
testDatabaseConnection();

// Start the server on Render's assigned port.
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
