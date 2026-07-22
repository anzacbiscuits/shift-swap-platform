const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const generateId = () => Math.random().toString(36).substr(2, 9);

const dateInRange = (date, rangeStart, rangeEnd) => {
  const d = new Date(date);
  return d >= new Date(rangeStart) && d <= new Date(rangeEnd);
};

router.get('/board', async (req, res) => {
  try {
    const swaps = await dbAll(`
      SELECT s.id, s.registrar_id, r.name, r.email, s.status, s.created_at
      FROM swaps s
      JOIN registrars r ON s.registrar_id = r.id
      WHERE s.status = 'active'
      ORDER BY r.name
    `);

    const swapDetails = await Promise.all(
      swaps.map(async (swap) => {
        const giveShifts = await dbAll(
          'SELECT * FROM swap_give_shifts WHERE swap_id = ?',
          [swap.id]
        );
        const unavailable = await dbAll(
          'SELECT * FROM swap_unavailable WHERE swap_id = ?',
          [swap.id]
        );
        const preferred = await dbAll(
          'SELECT * FROM swap_preferred_times WHERE swap_id = ?',
          [swap.id]
        );

        return {
          ...swap,
          giveShifts,
          unavailable,
          preferred
        };
      })
    );

    res.json(swapDetails);
  } catch (error) {
    console.error('Error fetching swaps:', error);
    res.status(500).json({ error: 'Failed to fetch swaps' });
  }
});

router.post('/create', verifyToken, async (req, res) => {
  try {
    const { giveShifts, unavailableDates, preferredTimes } = req.body;
    const registrarId = req.user.id;

    if (!giveShifts || !Array.isArray(giveShifts) || giveShifts.length === 0) {
      return res.status(400).json({ error: 'At least one shift to give is required' });
    }

    const swapId = generateId();

    await dbRun(
      'INSERT INTO swaps (id, registrar_id, status) VALUES (?, ?, ?)',
      [swapId, registrarId, 'active']
    );

    for (const shift of giveShifts) {
      await dbRun(
        'INSERT INTO swap_give_shifts (id, swap_id, date, shift_type) VALUES (?, ?, ?, ?)',
        [generateId(), swapId, shift.date, shift.shiftType]
      );
    }

    if (unavailableDates && Array.isArray(unavailableDates)) {
      for (const unavail of unavailableDates) {
        await dbRun(
          'INSERT INTO swap_unavailable (id, swap_id, date_start, date_end, time_slots, reason) VALUES (?, ?, ?, ?, ?, ?)',
          [generateId(), swapId, unavail.dateStart, unavail.dateEnd, JSON.stringify(unavail.timeSlots || []), unavail.reason || '']
        );
      }
    }

    if (preferredTimes && Array.isArray(preferredTimes)) {
      for (const pref of preferredTimes) {
        await dbRun(
          'INSERT INTO swap_preferred_times (id, swap_id, date_start, date_end, morning, evening, night) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [generateId(), swapId, pref.dateStart, pref.dateEnd, pref.morning ? 1 : 0, pref.evening ? 1 : 0, pref.night ? 1 : 0]
        );
      }
    }

    const matches = await findMatches(swapId, registrarId);

    res.json({
      message: 'Swap created successfully',
      swapId,
      matches
    });
  } catch (error) {
    console.error('Error creating swap:', error);
    res.status(500).json({ error: 'Failed to create swap' });
  }
});

const findMatches = async (newSwapId, newRegistrarId) => {
  try {
    const newSwap = await dbGet('SELECT * FROM swaps WHERE id = ?', [newSwapId]);
    const newGiveShifts = await dbAll('SELECT * FROM swap_give_shifts WHERE swap_id = ?', [newSwapId]);
    const newPreferred = await dbAll('SELECT * FROM swap_preferred_times WHERE swap_id = ?', [newSwapId]);

    const otherSwaps = await dbAll(
      'SELECT s.id, s.registrar_id FROM swaps s WHERE s.status = ? AND s.registrar_id != ? AND s.id != ?',
      ['active', newRegistrarId, newSwapId]
    );

    const matches = [];

    for (const otherSwap of otherSwaps) {
      const otherGiveShifts = await dbAll('SELECT * FROM swap_give_shifts WHERE swap_id = ?', [otherSwap.id]);
      const otherPreferred = await dbAll('SELECT * FROM swap_preferred_times WHERE swap_id = ?', [otherSwap.id]);

      const isMatch = checkTwoWayMatch(newGiveShifts, newPreferred, otherGiveShifts, otherPreferred);

      if (isMatch) {
        matches.push({
          swapId: otherSwap.id,
          registrarId: otherSwap.registrar_id,
          matchType: 'twoWay'
        });
      }
    }

    return matches;
  } catch (error) {
    console.error('Error finding matches:', error);
    return [];
  }
};

const checkTwoWayMatch = (giveShifts1, preferred1, giveShifts2, preferred2) => {
  let registrar1ToRegistrar2Match = false;
  for (const give of giveShifts1) {
    for (const pref of preferred2) {
      if (dateInRange(give.date, pref.date_start, pref.date_end)) {
        registrar1ToRegistrar2Match = true;
        break;
      }
    }
    if (registrar1ToRegistrar2Match) break;
  }

  let registrar2ToRegistrar1Match = false;
  for (const give of giveShifts2) {
    for (const pref of preferred1) {
      if (dateInRange(give.date, pref.date_start, pref.date_end)) {
        registrar2ToRegistrar1Match = true;
        break;
      }
    }
    if (registrar2ToRegistrar1Match) break;
  }

  return registrar1ToRegistrar2Match && registrar2ToRegistrar1Match;
};

router.post('/accept-offer', verifyToken, async (req, res) => {
  try {
    const { swapId1, swapId2, registrar1Id, registrar2Id } = req.body;

    if (req.user.id !== registrar1Id && req.user.id !== registrar2Id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const completedSwapId = generateId();

    const swap1GiveShifts = await dbAll('SELECT * FROM swap_give_shifts WHERE swap_id = ?', [swapId1]);
    const swap2GiveShifts = await dbAll('SELECT * FROM swap_give_shifts WHERE swap_id = ?', [swapId2]);

    await dbRun(
      `INSERT INTO completed_swaps (id, swap_id_1, swap_id_2, registrar_1_id, registrar_2_id, 
        registrar_1_gives_date, registrar_1_gives_shift, registrar_2_gives_date, registrar_2_gives_shift) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [completedSwapId, swapId1, swapId2, registrar1Id, registrar2Id,
       swap1GiveShifts[0].date, swap1GiveShifts[0].shift_type,
       swap2GiveShifts[0].date, swap2GiveShifts[0].shift_type]
    );

    await dbRun('UPDATE swaps SET status = ? WHERE id = ?', ['completed', swapId1]);
    await dbRun('UPDATE swaps SET status = ? WHERE id = ?', ['completed', swapId2]);

    res.json({ message: 'Swap accepted', completedSwapId });
  } catch (error) {
    console.error('Error accepting swap:', error);
    res.status(500).json({ error: 'Failed to accept swap' });
  }
});

router.get('/my-swaps', verifyToken, async (req, res) => {
  try {
    const swaps = await dbAll(
      'SELECT * FROM swaps WHERE registrar_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

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
    console.error('Error fetching user swaps:', error);
    res.status(500).json({ error: 'Failed to fetch swaps' });
  }
});

router.delete('/:swapId', verifyToken, async (req, res) => {
  try {
    const { swapId } = req.params;

    const swap = await dbGet('SELECT * FROM swaps WHERE id = ?', [swapId]);
    if (!swap) {
      return res.status(404).json({ error: 'Swap not found' });
    }

    if (swap.registrar_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

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
