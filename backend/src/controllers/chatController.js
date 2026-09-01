// Handles requests related to the chat.
export const healthCheck = (req, res) => {
  res.json({
    message: "ChatGPT Clone backend is running",
  });
};
