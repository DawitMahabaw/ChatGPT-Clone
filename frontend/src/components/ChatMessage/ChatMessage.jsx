import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

import styles from "./ChatMessage.module.css";

export default function ChatMessage({ role, content }) {
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      {/* Display a different icon for the user and AI. */}
      <div className={`${styles.avatar} ${styles[role]}`}>
        {role === "user" ? (
          <User size={18} color="white" />
        ) : (
          <Bot size={18} color="white" />
        )}
      </div>

      {/* Display the message content. */}
      <div className={styles.content}>
        {role === "user" ? (
          content
        ) : (
          <div className={styles.markdownBody}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
