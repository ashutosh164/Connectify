import { useEffect, useState, useRef } from "react";

function Chat({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const wsRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/`;

    // Create WebSocket connection
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data.message]);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      socket.close();
    };
  }, [conversationId]);


  // Send message
  const sendMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("WebSocket not connected!");
      return;
    }
    if (!inputMessage.trim()) return;

    wsRef.current.send(
      JSON.stringify({
        message: inputMessage,
      })
    );

    setInputMessage("");
  };


  return (
    <div style={{ padding: "20px", width: "400px", border: "1px solid #ddd" }}>
      <h2>Live Chat</h2>

      <div
        style={{
          height: "300px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, idx) => (
          <p key={idx} style={{ padding: "5px", background: "#f5f5f5" }}>
            {msg}
          </p>
        ))}
      </div>

      {/* ⛔ The issue was usually here: input disabled */}
      <input
        type="text"
        placeholder="Type a message..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        style={{ width: "75%", padding: "8px" }}
      />

      <button
        onClick={sendMessage}
        style={{
          padding: "8px 12px",
          marginLeft: "5px",
          background: "blue",
          color: "white",
          border: "none",
        }}
      >
        Send
      </button>
    </div>
  );
}

export default Chat;
