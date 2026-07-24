import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Messages.css';

const formatDMY = (iso) => {
  if (!iso) return '';
  const parts = String(iso).split('-');
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
};

function Messages({ user }) {
  const [offers, setOffers] = useState([]);
  const [selectedRegistrar, setSelectedRegistrar] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [registrars, setRegistrars] = useState([]);

  const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchRegistrars(), fetchOffers()]);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedRegistrar) fetchConversation(selectedRegistrar);
  }, [selectedRegistrar]);

  const fetchOffers = async () => {
    try {
      const response = await axios.get('/api/offers/inbox', authHeader());
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchRegistrars = async () => {
    try {
      const response = await axios.get('/api/swaps/board', authHeader());
      const unique = [...new Map(response.data.map(item => [item.registrar_id, item])).values()]
        .filter(item => item.registrar_id !== user.id);
      setRegistrars(unique);
    } catch (error) {
      console.error('Error fetching registrars:', error);
    }
  };

  const fetchConversation = async (registrarId) => {
    try {
      const response = await axios.get(`/api/messages/conversation/${registrarId}`, authHeader());
      setConversation(response.data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const respondToOffer = async (id, action) => {
    try {
      await axios.post(`/api/offers/${id}/${action}`, {}, authHeader());
      fetchOffers();
    } catch (error) {
      alert(error.response?.data?.error || 'Could not update the swap suggestion');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRegistrar) return;
    try {
      await axios.post('/api/messages/send', {
        recipientId: selectedRegistrar,
        message: newMessage
      }, authHeader());
      setNewMessage('');
      fetchConversation(selectedRegistrar);
    } catch (error) {
      alert(error.response?.data?.error || 'Could not send message');
    }
  };

  const describe = (o) =>
    `give your ${o.youGive.shift} on ${formatDMY(o.youGive.date)} for ${o.otherName}'s ${o.youReceive.shift} on ${formatDMY(o.youReceive.date)}`;

  if (loading) return <div className="loading">Loading messages...</div>;

  return (
    <div className="messages-container">
      <h1>Messages</h1>

      <div className="offers-section">
        <h2>Swap Suggestions</h2>
        {offers.length === 0 ? (
          <p className="offers-empty">No swap suggestions right now.</p>
        ) : (
          offers.map(o => (
            <div key={o.id} className={`offer-card ${o.status === 'agreed' ? 'offer-agreed' : 'offer-pending'}`}>
              {o.status === 'agreed' ? (
                <div className="offer-text">✓ Agreed with {o.otherName}: you {describe(o)}.</div>
              ) : (
                <>
                  <div className="offer-text">Suggested swap with {o.otherName}: {describe(o)}.</div>
                  {o.youAccepted ? (
                    <div className="offer-waiting">You accepted — waiting for {o.otherName} to respond.</div>
                  ) : (
                    <div className="offer-actions">
                      <button className="btn btn-success" onClick={() => respondToOffer(o.id, 'accept')}>Accept</button>
                      <button className="btn btn-secondary" onClick={() => respondToOffer(o.id, 'decline')}>Decline</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

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
