function ChatInput({ isLoading }) {
  return (
    <form>
      <input
        type="text"
        placeholder="Message ChatGPT..."
        disabled={isLoading}
      />

      <button type="submit" disabled={isLoading}>
        Send
      </button>
    </form>
  );
}

export default ChatInput;
