import { useState } from "react";
import { Plus, Mic, ArrowUp } from "lucide-react";

import styles from "./ChatInput.module.css";

export default function ChatInput({ handleSendMessage, isLoading }) {
  // Stores the text currently typed by the user.
  const [input, setInput] = useState("");

  // Handles submitting the chat form.
  const handleSubmit = (event) => {
    event.preventDefault();

    // Do not send an empty message or send while loading.
    if (!input.trim() || isLoading) {
      return;
    }

    handleSendMessage(input.trim());

    // Clear the input after sending.
    setInput("");
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Plus button */}
        <div className={styles.icon}>
          <Plus size={20} />
        </div>

        {/* Chat input */}
        <input
          type="text"
          className={styles.input}
          placeholder="Ask anything"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isLoading}
        />

        {/* Show send button when the user has typed something. */}
        {input.trim() ? (
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            <ArrowUp size={18} />
          </button>
        ) : (
          /* Otherwise show the microphone icon. */
          <div className={styles.icon}>
            <Mic size={20} />
          </div>
        )}
      </form>
    </div>
  );
}
