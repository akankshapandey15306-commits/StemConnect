
import { useState } from "react";


function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! Welcome to StemConnect. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";




  const sendMessage = async (e) => {
    e.preventDefault();

    const question = message.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chatbot/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      if (response.status === 429) {
        throw new Error("Too many messages. Please wait a minute.");
      }
      if (!response.ok || !response.body) {
        throw new Error("Chatbot request failed.");
      }

      setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, text: last.text + chunk };
          return copy;
        });
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: error.message.startsWith("Too many")
            ? error.message
            : "Sorry, I couldn't connect right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="sc-chatbot">
      {isOpen && (
        <section className="sc-chat-window">
          <header className="sc-chat-header">
            <div>
              <strong>StemConnect AI</strong>
              <small>Patient Support Assistant</small>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="sc-chat-messages" aria-live="polite">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`sc-chat-message ${item.role}`}
              >
                {item.text}
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="sc-chat-message assistant">
                Thinking...
              </div>
            )}
          </div>

          <form className="sc-chat-input" onSubmit={sendMessage}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask StemConnect..."
              aria-label="Your message"
              maxLength={2000}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !message.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="sc-chat-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}

export default Chatbot;
