import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Messages.css';

function Messages({ user }) {
  const [messages, setMessages] = useState([]);
  const [selectedRegistrar, setSelectedRegistrar] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [registrars, setRegistrars] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchRegistrars();
  }, []);

  useEffect(() => {
    if (selectedRegistrar) {
      fetchConversation(selectedRegistrar);
    }
  }, [selectedRegistrar]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/messages/inbox', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrars = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/swaps/board', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const uniqueRegistrars = [...new Map(response.data.map(item => [item.registrar_id, item])).values()];
      setRegistrars(uniqueRegistrars);
    } catch (error) {
      console.error('Error fetching registrars:', error);
    }
  };

  const fetchConversation = async (registrarId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/messages/conversation/${registrarId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversation(response.data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRegistrar) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages/send', {
        recipientId: selectedRegistrar,
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMessage('');
      fetchConversation(selectedRegistrar);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) return <div className="loading">Loading messages...</div>;

  return (
    <div className="messages-container">
      <h1>Messages</h1>
      <div className="messages-layout">
        <div className="registrar-list">
          <h2>Registrars</h2>
          {registrars.map(reg => (
            <div
              key={reg.registrar_id}
              className={`registrar-item ${selectedRegistrar === reg.registrar_id ? 'active' : ''}`}
              onClick={() => setSelectedRegistrar(reg.registrar_id)}
            >
              <strong>{reg.name}</strong>
              <small>{reg.email}</small>
            </div>
          ))}
        </div>

        <div className="conversation-panel">
          {selectedRegistrar ? (
            <>
              <h2>{registrars.find(r => r.registrar_id === selectedRegistrar)?.name}</h2>
              <div className="messages-list">
                {conversation.map(msg => (
                  <div key={msg.id} className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
                    <div className="message-header">
                      <strong>{msg.sender_name}</strong>
                      <small>{new Date(msg.created_at).toLocaleString('en-GB')}</small>
                    </div>
                    <div className="message-content">{msg.message}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="message-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={!selectedRegistrar}
                />
                <button type="submit" className="btn btn-primary">Send</button>
              </form>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a registrar to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
