import { useState } from "react";
import {
  MessageSquare,
  Search,
  SquarePen,
  Pencil,
  Trash2,
  Check,
  X,
  LogIn,
  LogOut,
  User,
  PanelLeftClose,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Sidebar.module.css";

/**
 * Helper to compute human-friendly relative timestamps like "2h ago", "1d ago"
 */
function getRelativeTime(dateString) {
  if (!dateString) return "Just now";
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default function Sidebar({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
}) {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Inline renaming state: { sessionId, newTitle }
  const [editingSession, setEditingSession] = useState(null);

  // Filtered session list based on live search
  const filteredSessions = sessions.filter((s) =>
    (s.title || "New chat").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const startRenaming = (session, e) => {
    e.stopPropagation();
    setEditingSession({
      sessionId: session.id,
      newTitle: session.title || "New chat",
    });
  };

  const handleSaveRename = (sessionId) => {
    if (editingSession && editingSession.newTitle.trim()) {
      onRenameSession(sessionId, editingSession.newTitle.trim());
    }
    setEditingSession(null);
  };

  const handleDelete = (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      onDeleteSession(sessionId);
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* Sidebar header */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.iconBtn} title="ChatGPT">
            <PanelLeftClose size={20} />
          </div>
          <span className={styles.brandName}>ChatGPT</span>
        </div>

        <button
          className={styles.iconBtn}
          onClick={onNewChat}
          title="New chat"
          type="button"
        >
          <SquarePen size={19} />
        </button>
      </div>

      {/* Action / New Chat Button */}
      <div className={styles.actionSection}>
        <button
          className={styles.newChatBtn}
          onClick={onNewChat}
          type="button"
        >
          <SquarePen size={18} />
          <span>New chat</span>
        </button>

        {/* Search chats */}
        <div className={styles.searchContainer}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery("")}
              type="button"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Saved Conversations List */}
      <div className={styles.historySection}>
        <div className={styles.sectionHeader}>YOUR CHATS</div>

        <div className={styles.conversationsList}>
          {filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isRenaming =
              editingSession && editingSession.sessionId === session.id;
            const relativeTime = getRelativeTime(
              session.updated_at || session.created_at,
            );

            return (
              <div
                key={session.id}
                className={`${styles.chatItem} ${
                  isActive ? styles.chatItemActive : ""
                }`}
                onClick={() => !isRenaming && onSelectSession(session.id)}
              >
                {isRenaming ? (
                  /* Inline Title Editing */
                  <div
                    className={styles.renameForm}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      className={styles.renameInput}
                      value={editingSession.newTitle}
                      autoFocus
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          newTitle: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(session.id);
                        if (e.key === "Escape") setEditingSession(null);
                      }}
                    />
                    <button
                      className={styles.renameActionBtn}
                      onClick={() => handleSaveRename(session.id)}
                      title="Save"
                      type="button"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      className={styles.renameActionBtn}
                      onClick={() => setEditingSession(null)}
                      title="Cancel"
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  /* Normal Chat Item Row */
                  <>
                    <div className={styles.chatTitleWrapper}>
                      <MessageSquare size={16} className={styles.chatIcon} />
                      <span className={styles.chatTitle}>
                        {session.title || "New chat"}
                      </span>
                    </div>

                    <span className={styles.timestamp}>{relativeTime}</span>

                    {/* Actions visible on hover or active */}
                    <div
                      className={styles.chatActions}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => startRenaming(session, e)}
                        title="Rename chat"
                        type="button"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => handleDelete(session.id, e)}
                        title="Delete chat"
                        type="button"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {filteredSessions.length === 0 && (
            <div className={styles.emptyNotice}>
              {searchQuery
                ? "No matching chats found."
                : "No saved chats yet. Start a new chat!"}
            </div>
          )}
        </div>
      </div>

      {/* Footer User Profile & Auth Section */}
      <footer className={styles.footer}>
        {isAuthenticated && user ? (
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {user.username
                ? user.username.substring(0, 2).toUpperCase()
                : "U"}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.username}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
            <button
              className={styles.logoutBtn}
              onClick={logout}
              title="Log out"
              type="button"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className={styles.authPromptCard}>
            <div className={styles.authPromptHeader}>
              <User size={16} />
              <span>Sign in for more</span>
            </div>
            <p className={styles.authPromptText}>
              Save chat history, rename conversations, and continue anytime.
            </p>
            <button
              className={styles.loginBtn}
              onClick={openLoginModal}
              type="button"
            >
              <LogIn size={15} />
              <span>Log in or Sign up</span>
            </button>
          </div>
        )}
      </footer>
    </aside>
  );
}
