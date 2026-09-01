import { GoogleGenAI } from "@google/genai";

// Get the Gemini model from .env.
// If it is not there, use this default model.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// Create the Gemini client.
const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Send a question to Gemini and return the answer.
export const generateAssistantResponse = async (question) => {
  const response = await geminiClient.models.generateContent({
    model: GEMINI_MODEL,
    contents: question,
  });

  return {
    text: response.text,
    totalTokens: response.usageMetadata?.totalTokenCount || 0,
  };
};



