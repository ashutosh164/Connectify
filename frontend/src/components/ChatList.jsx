import React, {useState, useEffect} from 'react';
import api from '../api'; // axios wrapper with credentials/token

export default function ChatList({onSelect}) {
  const [list, setList] = useState([]);
  useEffect(()=> {
    api.get('/chat/conversations/').then(res => setList(res.data)).catch(()=>{});
  },[]);
  return (
    <div>
      {list.map(c => (
        <div key={c.id} onClick={() => onSelect(c.id)} style={{padding:8,borderBottom:'1px solid #eee',cursor:'pointer'}}>
          <div>Conversation #{c.id}</div>
          <div style={{fontSize:12,color:'#666'}}>{c.last_message ? c.last_message.content : 'No messages yet'}</div>
        </div>
      ))}
    </div>
  );
}
