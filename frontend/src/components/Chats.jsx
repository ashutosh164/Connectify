// import { useEffect, useState, useRef } from "react";

// function Chat({ conversationId }) {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const wsRef = useRef(null);

//   useEffect(() => {
//     if (!conversationId) return;

//     const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/`;

//     // Create WebSocket connection
//     const socket = new WebSocket(wsUrl);
//     wsRef.current = socket;

//     socket.onopen = () => {
//       console.log("WebSocket connected");
//     };

//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       setMessages((prev) => [...prev, data.message]);
//     };

//     socket.onclose = () => {
//       console.log("WebSocket closed");
//     };

//     socket.onerror = (err) => {
//       console.error("WebSocket error:", err);
//     };

//     return () => {
//       socket.close();
//     };
//   }, [conversationId]);


//   // Send message
//   const sendMessage = () => {
//     if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
//       alert("WebSocket not connected!");
//       return;
//     }
//     if (!inputMessage.trim()) return;

//     wsRef.current.send(
//       JSON.stringify({
//         message: inputMessage,
//       })
//     );

//     setInputMessage("");
//   };


//   return (
//     <div style={{ padding: "20px", width: "400px", border: "1px solid #ddd" }}>
//       <h2>Live Chat</h2>

//       <div
//         style={{
//           height: "300px",
//           overflowY: "scroll",
//           border: "1px solid #ccc",
//           padding: "10px",
//           marginBottom: "10px",
//         }}
//       >
//         {messages.map((msg, idx) => (
//           <p key={idx} style={{ padding: "5px", background: "#f5f5f5" }}>
//             {msg}
//           </p>
//         ))}
//       </div>

//       {/* ⛔ The issue was usually here: input disabled */}
//       <input
//         type="text"
//         placeholder="Type a message..."
//         value={inputMessage}
//         onChange={(e) => setInputMessage(e.target.value)}
//         style={{ width: "75%", padding: "8px" }}
//       />

//       <button
//         onClick={sendMessage}
//         style={{
//           padding: "8px 12px",
//           marginLeft: "5px",
//           background: "blue",
//           color: "white",
//           border: "none",
//         }}
//       >
//         Send
//       </button>
//     </div>
//   );
// }

// export default Chat;





import { useEffect, useRef, useState } from "react";

export default function Chat({ username, targetUser }) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    socketRef.current = new WebSocket(
      `ws://localhost:8001/ws/chat/?username=${username}`
    );

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => socketRef.current.close();
  }, [username]);

  const sendMessage = () => {
    if (!text || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(
      JSON.stringify({
        to: targetUser,
        message: text
      })
    );

    setText("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        Chat with {targetUser}
      </div>

      <div style={styles.messages}>
        {messages.map((m, i) => {
          const isMe = m.from === username;
          return (
            <div
              key={i}
              style={{
                ...styles.bubble,
                alignSelf: isMe ? "flex-end" : "flex-start",
                background: isMe ? "#DCF8C6" : "#fff"
              }}
            >
              <div>{m.message}</div>
            </div>
          );
        })}
      </div>

      <div style={styles.inputBox}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "400px",
    height: "600px",
    border: "1px solid #ccc",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Arial"
  },
  header: {
    padding: "10px",
    background: "#075E54",
    color: "#fff",
    textAlign: "center"
  },
  messages: {
    flex: 1,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    overflowY: "auto",
    background: "#ECE5DD"
  },
  bubble: {
    maxWidth: "70%",
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "14px"
  },
  inputBox: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ddd"
  },
  input: {
    flex: 1,
    padding: "8px"
  },
  sendBtn: {
    marginLeft: "8px",
    padding: "8px 12px",
    background: "#25D366",
    border: "none",
    color: "#fff",
    cursor: "pointer"
  }
};
