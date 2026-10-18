import { useState, useEffect } from "react";
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

  // Custom delete confirmation modal state
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (session, e) => {
    e.stopPropagation();
    setSessionToDelete(session);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      setIsDeleting(true);
      await onDeleteSession(sessionToDelete.id);
      setSessionToDelete(null);
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setSessionToDelete(null);
    }
  };

  // Close delete modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && sessionToDelete && !isDeleting) {
        setSessionToDelete(null);
      }
    };
    if (sessionToDelete) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sessionToDelete, isDeleting]);

  return (
    <>
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

          {/* Search applies only to the signed-in user's private history. */}
          {isAuthenticated && (
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
          )}
        </div>

        {/* Saved Conversations List */}
        <div className={styles.historySection}>
          <div className={styles.sectionHeader}>
            {isAuthenticated ? "YOUR CHATS" : "CHAT HISTORY"}
          </div>

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
                          onClick={(e) => handleDeleteClick(session, e)}
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
                  : isAuthenticated
                    ? "No saved chats yet. Start a new chat!"
                    : "Log in or sign up to save chats to your account."}
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

      {/* ChatGPT-style Delete Confirmation Modal */}
      {sessionToDelete && (
        <div
          className={styles.modalOverlay}
          onClick={handleCancelDelete}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-chat-modal-title"
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 id="delete-chat-modal-title" className={styles.modalTitle}>
                Delete chat?
              </h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={handleCancelDelete}
                aria-label="Close dialog"
                disabled={isDeleting}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                This will delete{" "}
                <strong className={styles.modalHighlight}>
                  {sessionToDelete.title || "New chat"}
                </strong>
                .
              </p>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
