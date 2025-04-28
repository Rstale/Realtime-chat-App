import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');
const username = "Abhishek Tale Patil";

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('typing', (users) => {
      setTypingUsers(users.filter((u) => u !== username));
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      const timestamp = new Date().toLocaleTimeString();
      socket.emit('send_message', { username, message, timestamp });
      setMessage('');
      socket.emit('stop_typing', { username });
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', { username });
    if (e.target.value === '') {
      socket.emit('stop_typing', { username });
    }
  };

  return (
    <div style={{ width: '400px', margin: '0 auto' }}>
      <h2>Welcome {username}</h2>
      <div
        style={{
          height: '300px',
          border: '1px solid #ccc',
          overflowY: 'auto',
          padding: '10px',
          marginBottom: '10px',
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: 'left', marginBottom: '8px' }}>
            <strong>{msg.username}</strong>{' '}
            <span style={{ fontSize: '0.8em', color: '#999' }}>({msg.timestamp})</span>: {msg.message}
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div style={{ fontStyle: 'italic', color: 'gray' }}>
            {typingUsers.join(', ')} typing...
          </div>
        )}
        <div ref={messageEndRef} />
      </div>
      <input
        type="text"
        value={message}
        onChange={handleTyping}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type your message"
        style={{ width: '80%', padding: '8px' }}
      />
      <button onClick={handleSend} style={{ padding: '8px' }}>Send</button>
    </div>
  );
}

export default Chat;