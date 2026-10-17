import { useState } from "react";
import { X, Sparkles, AlertCircle, Loader2, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./AuthModal.module.css";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    login,
    signup,
  } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isLogin && !username.trim()) {
      setError("Please enter a username.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isLogin) {
        await login({ email: email.trim(), password });
      } else {
        await signup({
          username: username.trim(),
          email: email.trim(),
          password,
        });
      }
      // Reset form
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (mode) => {
    setAuthModalMode(mode);
    setError("");
  };

  return (
    <div className={styles.overlay} onClick={closeAuthModal}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brandIcon}>
            <Sparkles size={22} className={styles.sparkle} />
          </div>
          <button
            className={styles.closeBtn}
            onClick={closeAuthModal}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <div className={styles.titleSection}>
          <h2 className={styles.title}>
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className={styles.subtitle}>
            {isLogin
              ? "Sign in to access your saved chats and continue conversations."
              : "Sign up to start saving and organizing your ChatGPT conversations."}
          </p>
        </div>

        {/* Tab switch */}
        <div className={styles.tabContainer}>
          <button
            type="button"
            className={`${styles.tabBtn} ${isLogin ? styles.tabActive : ""}`}
            onClick={() => switchMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${!isLogin ? styles.tabActive : ""}`}
            onClick={() => switchMode("signup")}
          >
            Sign up
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label htmlFor="auth-username" className={styles.label}>
                Username
              </label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  id="auth-username"
                  type="text"
                  placeholder="e.g. Dawit"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.input}
                  required={!isLogin}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="auth-email" className={styles.label}>
              Email address
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="auth-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="auth-password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="auth-password"
                type="password"
                placeholder={isLogin ? "••••••••" : "At least 6 characters"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Please wait...</span>
              </>
            ) : isLogin ? (
              "Log in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className={styles.footerPrompt}>
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => switchMode("signup")}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => switchMode("login")}
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
