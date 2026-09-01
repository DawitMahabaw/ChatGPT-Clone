import { useState, useEffect, useRef } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import MessageList from "./components/MessageList/MessageList";
import ChatInput from "./components/ChatInput/ChatInput";

function App() {
  // Stores all messages in the conversation.
  const [conversations, setConversations] = useState([]);

  // Tells us whether the AI is currently responding.
  const [isLoading, setIsLoading] = useState(false);

  // Gives us a reference to the bottom of the message list.
  const messagesEndRef = useRef(null);

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

        <ChatInput isLoading={isLoading} />
      </main>
    </div>
  );
}

export default App;
