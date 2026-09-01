import { useState, useRef } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import MessageList from "./components/MessageList/MessageList";
import ChatInput from "./components/ChatInput/ChatInput";

function App() {
  // Stores all messages in the current conversation.
  const [conversations, setConversations] = useState([]);

  // Tells the UI whether the AI is currently responding.
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the bottom of the message list.
  const messagesEndRef = useRef(null);

  // This function will eventually send the question to our backend.
  const handleSendMessage = (question) => {
    // For now, just add the user's question to the screen.
    const newMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setConversations((previousConversations) => [
      ...previousConversations,
      newMessage,
    ]);
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
