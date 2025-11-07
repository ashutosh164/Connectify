// Chat.js
import React, { useEffect, useRef, useState } from 'react';

export default function Chat({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const wsRef = useRef(null);

  useEffect(() => {
    // fetch last messages (REST)
    fetch(`/api/conversations/${conversationId}/messages/`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // if using DRF ListAPIView without pagination it returns list
        setMessages(Array.isArray(data) ? data.reverse() : []);
      });

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/ws/chat/${conversationId}/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log('ws open');
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'message.received') {
        setMessages(prev => [...prev, data.message]);
      }
    };
    ws.onclose = () => console.log('ws closed');

    return () => {
      ws.close();
    };
  }, [conversationId]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const payload = { type: 'message.create', content: text.trim() };
    wsRef.current.send(JSON.stringify(payload));
    setText('');
  };

  return (
    <div style={{border:'1px solid #ccc', padding:12, width:400}}>
      <div style={{height:300, overflowY:'auto', marginBottom:8}}>
        {messages.map(m => (
          <div key={m.id} style={{marginBottom:8}}>
            <b>{m.sender && m.sender.username ? m.sender.username : m.sender_username}</b>: {m.content}
            <div style={{fontSize:10, color:'#888'}}>{new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex', gap:8}}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          style={{flex:1}}
          onKeyDown={e => e.key === 'Enter' ? sendMessage() : null}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
