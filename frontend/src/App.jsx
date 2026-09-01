import { useState, useRef, useEffect } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import MessageList from "./components/MessageList/MessageList";
import ChatInput from "./components/ChatInput/ChatInput";
import { sendMessage, getConversations } from "./api/chatApi";

function App() {
  // Stores all messages in the current conversation.
  const [conversations, setConversations] = useState([]);

  // Tells the UI whether the AI is currently responding.
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the bottom of the message list.
  const messagesEndRef = useRef(null);


  // Load previous conversations when the app starts.
  useEffect(() => {
  const loadConversations = async () => {
    try {
      // Tell the UI that conversations are loading.
      setIsLoading(true);

      const conversations = await getConversations();

      setConversations(conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      // Loading is finished whether the request succeeds or fails.
      setIsLoading(false);
    }
  };

    loadConversations();
  }, []);

  // This function will eventually send the question to our backend.
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
      // Show the loading state while waiting for the backend.
      setIsLoading(true);

      // Send the question to our backend.
      const response = await sendMessage(question);

      // Add the AI response to the conversation.
      const assistantMessage = {
        id: response.assistantConversationId,
        role: "assistant",
        content: response.answer,
      };

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
      // Stop the loading state whether the request succeeds or fails.
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="chat">
        <ChatHeader />

        <MessageList
          conversations={conversations}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput isLoading={isLoading} onSendMessage={handleSendMessage} />
      </main>
    </div>
  );
}

export default App;
