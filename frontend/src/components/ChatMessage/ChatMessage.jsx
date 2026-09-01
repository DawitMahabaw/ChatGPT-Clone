function ChatMessage({ conversation }) {
  const isUser = conversation.role === "user";

  return (
    <div className={isUser ? "user-message" : "assistant-message"}>
      <strong>{isUser ? "You" : "ChatGPT"}</strong>

      <p>{conversation.content}</p>
    </div>
  );
}

export default ChatMessage;
