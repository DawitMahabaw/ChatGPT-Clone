import ChatMessage from "../ChatMessage/ChatMessage";

function MessageList({ conversations, isLoading, messagesEndRef }) {
  return (
    <div className="message-list">
      {conversations.map((conversation) => (
        <ChatMessage key={conversation.id} conversation={conversation} />
      ))}

      {isLoading && (
        <div>
          <p>Thinking...</p>
        </div>
      )}

      {/* Used later to scroll to the newest message */}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
