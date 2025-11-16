import React, {useEffect, useState, useRef} from 'react';
import useChatSocket from '../hooks/useChatSocket';
import api from '../api';
import dayjs from 'dayjs';

export default function ChatWindow({conversationId, currentUser}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { send, connected } = useChatSocket(conversationId, (data) => {
    if (!data || !data.type) return;
    if (data.type === 'message.received') {
      setMessages(m => [...m, data.message]);
    } else if (data.type === 'typing') {
      setTypingUsers(t => {
        if (t.find(u=>u.id===data.user.id)) return t;
        return [...t, data.user];
      });
      setTimeout(()=> setTypingUsers(t => t.filter(u=>u.id!==data.user.id)), 2000);
    } else if (data.type === 'presence') {
      if (data.action === 'online') setOnlineUsers(u => [...new Set([...u, data.user.username])]);
      else setOnlineUsers(u => u.filter(x => x !== data.user.username));
    } else if (data.type === 'message.seen') {
      // update message seen list if you store it client-side
      const { message_id, user_id } = data;
      setMessages(ms => ms.map(m => m.id===message_id ? {...m, seen_by: [...(m.seen_by||[]), user_id]} : m));
    }
  }, {autoReconnect:true});

  useEffect(()=> {
    let mounted = true;
    if (!conversationId) return;
    api.get(`/chat/conversations/${conversationId}/messages/`).then(res => {
      if (!mounted) return;
      setMessages(res.data);
    }).catch(()=>{});
    return ()=> mounted=false;
  },[conversationId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const ok = send({type:'message.create', content: input.trim()});
    if (ok) setInput('');
  };

  const notifyTyping = () => send({type:'typing'});

  const markSeen = (message) => {
    // call API and send websocket seen event
    api.post(`/chat/conversations/${conversationId}/mark-seen/`, { message_id: message.id }).catch(()=>{});
    send({type:'message.seen', message_id: message.id});
  };

  const formatTime = (iso) => dayjs(iso).format('HH:mm');

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{padding:8,borderBottom:'1px solid #eee'}}>
        <strong>Online:</strong> {onlineUsers.join(', ')}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:8}}>
        {messages.map(m => {
          const mine = currentUser && (m.sender_username === currentUser || m.sender_id === currentUser);
          return (
            <div key={m.id} style={{display:'flex',justifyContent: mine ? 'flex-end':'flex-start', marginBottom:8}}>
              <div style={{maxWidth:'70%',background: mine ? '#0ea5a0':'#eee',color: mine ? 'white':'black',padding:8,borderRadius:8}}>
                {!mine && <div style={{fontSize:12,opacity:0.8}}>{m.sender_username}</div>}
                <div>{m.content}</div>
                <div style={{fontSize:10,opacity:0.7,marginTop:6}}>{formatTime(m.created_at)}</div>
                <div style={{fontSize:10,opacity:0.6}}>Seen: {(m.seen_by||[]).length}</div>
                <button onClick={()=>markSeen(m)} style={{fontSize:10,marginTop:4}}>Mark seen</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{padding:8,borderTop:'1px solid #eee'}}>
        {typingUsers.length > 0 && <div style={{fontSize:12,color:'#666'}}>{typingUsers.map(t=>t.username).join(', ')} typing...</div>}
        <div style={{display:'flex',gap:8}}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            onInput={notifyTyping}
            style={{flex:1,padding:8}}
            placeholder={connected?'Type a message...':'Connecting...'}
            disabled={!connected}
          />
          <button onClick={sendMessage} disabled={!connected || !input.trim()} style={{padding:'8px 12px'}}>Send</button>
        </div>
      </div>
    </div>
  );
}
