function MessageList({ conversations, isLoading, messagesEndRef }) {
  return (
    <div className="message-list">
      {conversations.map((conversation) => (
        <div key={conversation.id}>
          <strong>{conversation.role}:</strong>
          <p>{conversation.content}</p>
        </div>
      ))}

      {isLoading && (
        <div>
          <p>Thinking...</p>
        </div>
      )}

      {/* Used to scroll to the newest message */}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
