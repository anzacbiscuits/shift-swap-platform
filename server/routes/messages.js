const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const generateId = () => Math.random().toString(36).substr(2, 9);

router.post('/send', verifyToken, async (req, res) => {
  try {
    const { recipientId, message, completedSwapId } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !message) {
      return res.status(400).json({ error: 'Recipient and message required' });
    }

    if (recipientId === senderId) {
      return res.status(400).json({ error: 'You cannot message yourself' });
    }

    const id = generateId();
    await dbRun(
      'INSERT INTO messages (id, sender_id, recipient_id, completed_swap_id, message) VALUES (?, ?, ?, ?, ?)',
      [id, senderId, recipientId, completedSwapId || null, message]
    );

    res.json({ message: 'Message sent', messageId: id });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/inbox', verifyToken, async (req, res) => {
  try {
    const messages = await dbAll(
      `SELECT m.*, r.name as sender_name, r.email as sender_email
       FROM messages m
       JOIN registrars r ON m.sender_id = r.id
       WHERE m.recipient_id = ?
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.get('/conversation/:registrarId', verifyToken, async (req, res) => {
  try {
    const { registrarId } = req.params;
    const userId = req.user.id;

    const messages = await dbAll(
      `SELECT m.*, r.name as sender_name
       FROM messages m
       JOIN registrars r ON m.sender_id = r.id
       WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, registrarId, registrarId, userId]
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

module.exports = router;
