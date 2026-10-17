import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import MessageList from "./components/MessageList/MessageList";
import ChatInput from "./components/ChatInput/ChatInput";
import AuthModal from "./components/AuthModal/AuthModal";
import { useAuth } from "./context/AuthContext";
import {
  getChatSessions,
  getSessionMessages,
  sendMessage,
  renameChatSession,
  deleteChatSession,
} from "./api/chatApi";

import "./App.css";

function App() {
  const { user, isAuthenticated } = useAuth();

  // List of all saved chat sessions for the active user
  const [sessions, setSessions] = useState([]);

  // Active chat session ID (null represents a fresh/unsaved new chat)
  const [activeSessionId, setActiveSessionId] = useState(null);

  // Active chat title for header display
  const [activeTitle, setActiveTitle] = useState("");

  // Stores all messages displayed in the current chat
  const [conversations, setConversations] = useState([]);

  // Loading state for Gemini response or chat loading
  const [isLoading, setIsLoading] = useState(false);

  // Used to automatically scroll to newest message
  const messagesEndRef = useRef(null);

  // Load user sessions from backend
  const loadSessions = useCallback(async (selectRecent = false) => {
    try {
      const data = await getChatSessions();
      setSessions(data);

      // If requested and we have sessions and none is selected, load the first one
      if (selectRecent && data && data.length > 0) {
        const first = data[0];
        setActiveSessionId(first.id);
        setActiveTitle(first.title);
        const thread = await getSessionMessages(first.id);
        setConversations(thread.messages || []);
      }
    } catch (error) {
      console.warn("Could not load sessions:", error.message);
    }
  }, []);

  // Reload sessions whenever auth state changes (login / logout)
  useEffect(() => {
    loadSessions(true);
    if (!isAuthenticated) {
      setActiveSessionId(null);
      setActiveTitle("");
      setConversations([]);
    }
  }, [isAuthenticated, user, loadSessions]);

  // Scroll to bottom when conversation or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversations, isLoading]);

  // Select an existing chat session to continue the conversation
  const handleSelectSession = async (sessionId) => {
    if (sessionId === activeSessionId) return;

    try {
      setIsLoading(true);
      setActiveSessionId(sessionId);

      const data = await getSessionMessages(sessionId);
      setConversations(data.messages || []);
      setActiveTitle(data.session?.title || "Chat");
    } catch (error) {
      console.error("Error loading chat session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start a fresh, blank new chat
  const handleNewChat = () => {
    setActiveSessionId(null);
    setActiveTitle("New chat");
    setConversations([]);
  };

  // Rename a saved chat session
  const handleRenameSession = async (sessionId, newTitle) => {
    try {
      await renameChatSession(sessionId, newTitle);

      // Update in local sessions list
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s)),
      );

      // If renaming currently active chat, update title in header
      if (activeSessionId === sessionId) {
        setActiveTitle(newTitle);
      }
    } catch (error) {
      console.error("Error renaming chat session:", error);
    }
  };

  // Delete a saved chat session
  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteChatSession(sessionId);

      // Remove from local sessions state
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      // If active session was deleted, reset to a new chat
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    } catch (error) {
      console.error("Error deleting chat session:", error);
    }
  };

  // Send the user's message and handle continuing / creating the chat
  const handleSendMessage = async (question) => {
    // Show the user's message immediately
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setConversations((prev) => [...prev, userMessage]);

    try {
      setIsLoading(true);

      // Send to backend, passing activeSessionId so it continues the chat thread
      const response = await sendMessage(question, activeSessionId);

      const assistantMessage = {
        id: response.assistantConversationId,
        role: "assistant",
        content: response.answer,
      };

      setConversations((prev) => [...prev, assistantMessage]);

      // If this was a new chat or title changed, update active state & sessions list
      if (!activeSessionId || activeSessionId !== response.sessionId) {
        setActiveSessionId(response.sessionId);
        setActiveTitle(response.sessionTitle);

        // Prepend new session to sidebar list
        const newSessionObj = {
          id: response.sessionId,
          title: response.sessionTitle,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setSessions((prev) => [
          newSessionObj,
          ...prev.filter((s) => s.id !== response.sessionId),
        ]);
      } else {
        // Refresh session timestamps in sidebar
        setSessions((prev) =>
          prev.map((s) =>
            s.id === response.sessionId
              ? {
                  ...s,
                  title: response.sessionTitle || s.title,
                  updated_at: new Date().toISOString(),
                }
              : s,
          ),
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: error.message,
      };

      setConversations((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Left sidebar with saved chats, new chat, rename, and user auth */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
      />

      <main className="chat">
        {/* Top chat header */}
        <ChatHeader activeTitle={activeTitle} />

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

      {/* Authentication modal for Sign up and Login */}
      <AuthModal />
    </div>
  );
}

export default App;
