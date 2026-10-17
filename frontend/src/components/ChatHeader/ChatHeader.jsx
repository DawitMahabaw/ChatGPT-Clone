import { ChevronDown, Sparkles, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./ChatHeader.module.css";

export default function ChatHeader({ activeTitle }) {
  const { user, isAuthenticated, openLoginModal, openSignupModal } = useAuth();

  return (
    <header className={styles.header}>
      {/* Chat Title / Model indicator */}
      <div className={styles.left}>
        <span className={styles.brandTitle}>
          {activeTitle ? activeTitle : "ChatGPT"}
        </span>
        <div className={styles.modelTag}>
          <Sparkles size={13} className={styles.sparkleIcon} />
          <span>Gemini 3.5</span>
          <ChevronDown size={14} />
        </div>
      </div>

      {/* User profile or Auth buttons */}
      <div className={styles.right}>
        {isAuthenticated && user ? (
          <div className={styles.userBadge} title={`Logged in as ${user.email}`}>
            <div className={styles.avatar}>
              {user.username
                ? user.username.substring(0, 2).toUpperCase()
                : "U"}
            </div>
            <span className={styles.headerUsername}>{user.username}</span>
          </div>
        ) : (
          <div className={styles.authButtons}>
            <button
              className={styles.loginBtn}
              onClick={openLoginModal}
              type="button"
            >
              <LogIn size={14} />
              <span>Log in</span>
            </button>
            <button
              className={styles.signupBtn}
              onClick={openSignupModal}
              type="button"
            >
              <UserPlus size={14} />
              <span>Sign up</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
