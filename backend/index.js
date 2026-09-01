import express from "express";

const app = express();

const PORT = 4000;

// Allows Express to read JSON request bodies.
app.use(express.json());

// Simple test route.
app.get("/", (req, res) => {
  res.json({
    message: "ChatGPT Clone backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
