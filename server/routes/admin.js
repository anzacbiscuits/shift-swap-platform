const express = require('express');
const bcrypt = require('bcryptjs');
const { dbRun, dbGet, dbAll } = require('../database');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();
const generateId = () => Math.random().toString(36).substr(2, 9);

router.get('/registrars', verifyAdmin, async (req, res) => {
  try {
    const registrars = await dbAll('SELECT id, name, email, role, created_at FROM registrars');
    res.json(registrars);
  } catch (error) {
    console.error('Error fetching registrars:', error);
    res.status(500).json({ error: 'Failed to fetch registrars' });
  }
});

router.post('/registrars/create', verifyAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await dbGet('SELECT * FROM registrars WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateId();
    await dbRun(
      'INSERT INTO registrars (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, 'registrar']
    );

    res.json({ message: 'Registrar created', id });
  } catch (error) {
    console.error('Error creating registrar:', error);
    res.status(500).json({ error: 'Failed to create registrar' });
  }
});

router.delete('/registrars/:registrarId', verifyAdmin, async (req, res) => {
  try {
    const { registrarId } = req.params;

    const swaps = await dbAll('SELECT id FROM swaps WHERE registrar_id = ?', [registrarId]);
    for (const swap of swaps) {
      await dbRun('DELETE FROM swap_give_shifts WHERE swap_id = ?', [swap.id]);
      await dbRun('DELETE FROM swap_unavailable WHERE swap_id = ?', [swap.id]);
      await dbRun('DELETE FROM swap_preferred_times WHERE swap_id = ?', [swap.id]);
    }

    await dbRun('DELETE FROM swaps WHERE registrar_id = ?', [registrarId]);
    await dbRun('DELETE FROM giveaways WHERE registrar_id = ?', [registrarId]);
    await dbRun('DELETE FROM messages WHERE sender_id = ? OR recipient_id = ?', [registrarId, registrarId]);
    await dbRun('DELETE FROM registrars WHERE id = ?', [registrarId]);

    res.json({ message: 'Registrar deleted' });
  } catch (error) {
    console.error('Error deleting registrar:', error);
    res.status(500).json({ error: 'Failed to delete registrar' });
  }
});

router.get('/swaps', verifyAdmin, async (req, res) => {
  try {
    const swaps = await dbAll(`
      SELECT s.id, s.registrar_id, r.name, s.status, s.created_at
      FROM swaps s
      JOIN registrars r ON s.registrar_id = r.id
      ORDER BY s.created_at DESC
    `);

    const swapDetails = await Promise.all(
      swaps.map(async (swap) => {
        const giveShifts = await dbAll('SELECT * FROM swap_give_shifts WHERE swap_id = ?', [swap.id]);
        const unavailable = await dbAll('SELECT * FROM swap_unavailable WHERE swap_id = ?', [swap.id]);
        const preferred = await dbAll('SELECT * FROM swap_preferred_times WHERE swap_id = ?', [swap.id]);

        return { ...swap, giveShifts, unavailable, preferred };
      })
    );

    res.json(swapDetails);
  } catch (error) {
    console.error('Error fetching swaps:', error);
    res.status(500).json({ error: 'Failed to fetch swaps' });
  }
});

router.delete('/swaps/:swapId', verifyAdmin, async (req, res) => {
  try {
    const { swapId } = req.params;

    await dbRun('DELETE FROM swap_give_shifts WHERE swap_id = ?', [swapId]);
    await dbRun('DELETE FROM swap_unavailable WHERE swap_id = ?', [swapId]);
    await dbRun('DELETE FROM swap_preferred_times WHERE swap_id = ?', [swapId]);
    await dbRun('DELETE FROM swaps WHERE id = ?', [swapId]);

    res.json({ message: 'Swap deleted' });
  } catch (error) {
    console.error('Error deleting swap:', error);
    res.status(500).json({ error: 'Failed to delete swap' });
  }
});

module.exports = router;
