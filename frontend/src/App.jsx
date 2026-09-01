import { useState, useEffect, useRef } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import MessageList from "./components/MessageList/MessageList";
import ChatInput from "./components/ChatInput/ChatInput";
import { sendMessage, getConversations } from "./api/chatApi";

import "./App.css";

function App() {
  // Stores all messages displayed in the chat.
  const [conversations, setConversations] = useState([]);

  // Tells the UI when conversations or Gemini are loading.
  const [isLoading, setIsLoading] = useState(false);

  // Used to automatically scroll to the newest message.
  const messagesEndRef = useRef(null);

  // Load previous conversations when the application starts.
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);

        const conversations = await getConversations();

        setConversations(conversations);
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Scroll to the newest message whenever the conversation changes.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversations, isLoading]);

  // Send the user's question to the backend.
  const handleSendMessage = async (question) => {
    // Show the user's message immediately.
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setConversations((previousConversations) => [
      ...previousConversations,
      userMessage,
    ]);

    try {
      // Show the loading animation while waiting for Gemini.
      setIsLoading(true);

      // Send the question to our backend.
      const response = await sendMessage(question);

      // The backend returns the assistant's message
      // using assistantConversationId and answer.
      const assistantMessage = {
        id: response.assistantConversationId,
        role: "assistant",
        content: response.answer,
      };

      // Add Gemini's response to the conversation.
      setConversations((previousConversations) => [
        ...previousConversations,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Show a simple error message if something goes wrong.
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: error.message,
      };

      setConversations((previousConversations) => [
        ...previousConversations,
        errorMessage,
      ]);
    } finally {
      // Stop the loading animation.
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Left sidebar */}
      <Sidebar />

      <main className="chat">
        {/* Top chat header */}
        <ChatHeader />

        {/* Conversation messages */}
        <MessageList
          conversations={conversations}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />

        {/* Message input */}
        <ChatInput
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;
