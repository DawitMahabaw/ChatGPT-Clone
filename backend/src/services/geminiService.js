import { GoogleGenAI } from "@google/genai";

// Get the Gemini model from .env.
// If it is not there, use this default model.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// Create the Gemini client.
const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Send a question to Gemini and return the answer, optionally maintaining
 * context history so the conversation can continue seamlessly.
 *
 * @param {string} question - The user's prompt
 * @param {Array<{role: string, content: string}>} [history=[]] - Past conversation messages
 */
export const generateAssistantResponse = async (question, history = []) => {
  // Format past history for Gemini (@google/genai requires role to be 'user' or 'model')
  const formattedHistory = history
    .filter((msg) => msg.content && msg.content.trim())
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

  try {
    if (formattedHistory.length > 0) {
      // Use chat session with history for contextual continuity
      const chat = geminiClient.chats.create({
        model: GEMINI_MODEL,
        history: formattedHistory,
      });

      const response = await chat.sendMessage({
        message: question,
      });

      return {
        text: response.text,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
      };
    }

    // Direct single prompt if no history
    const response = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: question,
    });

    return {
      text: response.text,
      totalTokens: response.usageMetadata?.totalTokenCount || 0,
    };
  } catch (error) {
    console.error("Gemini API error:", error.message);
    throw error;
  }
};
