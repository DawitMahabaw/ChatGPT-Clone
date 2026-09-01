import { useState } from "react";

function ChatInput({ isLoading, onSendMessage }) {
  // Stores whatever the user is currently typing.
  const [message, setMessage] = useState("");

  // Runs when the form is submitted.
  const handleSubmit = (event) => {
    event.preventDefault();

    // Don't send an empty message.
    if (!message.trim()) {
      return;
    }

    // Send the message to the parent component.
    onSendMessage(message);

    // Clear the input after sending.
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        placeholder="Message ChatGPT..."
        disabled={isLoading}
        onChange={(event) => setMessage(event.target.value)}
      />

      <button type="submit" disabled={isLoading}>
        Send
      </button>
    </form>
  );
}

export default ChatInput;
