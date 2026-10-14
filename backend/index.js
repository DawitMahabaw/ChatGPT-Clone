import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRoutes from "./src/routes/chatRoutes.js";
import dbConnection from "./src/config/database.js";
import { initializeDatabase } from "./src/config/initializeDatabase.js";

const app = express();

// Allow the frontend to communicate with the backend.
app.use(cors());

// Allows Express to read JSON request bodies.
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ChatGPT Clone API is running!");
});

// Chat routes.
app.use("/api/chat", chatRoutes);

// Initialize the database before accepting requests.
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log("MySQL database connected and schema initialized");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Backend startup failed; database initialization did not complete:",
      error.message,
    );

    try {
      await dbConnection.end();
    } catch (closeError) {
      console.error("Failed to close the MySQL connection pool:", closeError.message);
    }

    process.exitCode = 1;
  }
};

// Start the server on Render's assigned port.
const PORT = process.env.PORT || 3000;

await startServer();
