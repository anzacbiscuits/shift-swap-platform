const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const generateId = () => Math.random().toString(36).substr(2, 9);

const partyRole = (offer, userId) => {
  if (offer.registrar_1_id === userId) return 1;
  if (offer.registrar_2_id === userId) return 2;
  return 0;
};

const deleteOneGiveShift = async (swapId, date, shift) => {
  const row = await dbGet(
    'SELECT id FROM swap_give_shifts WHERE swap_id = ? AND date = ? AND shift_type = ? LIMIT 1',
    [swapId, date, shift]
  );
  if (row) await dbRun('DELETE FROM swap_give_shifts WHERE id = ?', [row.id]);
};

const cancelStaleOffers = async (currentOfferId, consumed) => {
  const pending = await dbAll("SELECT * FROM swap_offers WHERE status = 'pending' AND id != ?", [currentOfferId]);
  for (const o of pending) {
    const sides = [
      { swapId: o.swap_id_1, date: o.give1_date, shift: o.give1_shift },
      { swapId: o.swap_id_2, date: o.give2_date, shift: o.give2_shift }
    ];
    const clash = sides.some(sd => consumed.some(c =>
      c.swapId === sd.swapId && c.date === sd.date && c.shift === sd.shift));
    if (clash) {
      await dbRun("UPDATE swap_offers SET status = 'declined' WHERE id = ?", [o.id]);
    }
  }
};

// Finalize a fully-accepted offer: settle the swap and clean up the board.
const finalizeOffer = async (offer) => {
  const { swap_id_1, swap_id_2, registrar_1_id, registrar_2_id,
          give1_date, give1_shift, give2_date, give2_shift } = offer;

  // 1) remove the actioned give-shift from each line
  await deleteOneGiveShift(swap_id_1, give1_date, give1_shift);
  await deleteOneGiveShift(swap_id_2, give2_date, give2_shift);

  // 2) mark both registrars unavailable on both swapped dates (their own lines)
  const dates = [give1_date, give2_date];
  for (const swapId of [swap_id_1, swap_id_2]) {
    for (const d of dates) {
      await dbRun(
        `INSERT INTO swap_unavailable (id, swap_id, date_start, date_end, time_slots, reason)
         VALUES (?, ?, ?, ?, '[]', 'Swap agreed')`,
        [generateId(), swapId, d, d]
      );
    }
  }

  // 3) cancel other pending offers that reference either consumed shift
  await cancelStaleOffers(offer.id, [
    { swapId: swap_id_1, date: give1_date, shift: give1_shift },
    { swapId: swap_id_2, date: give2_date, shift: give2_shift }
  ]);

  // 4) if a line has no give-shifts left, drop it off the active board
  for (const swapId of [swap_id_1, swap_id_2]) {
    const remaining = await dbAll('SELECT id FROM swap_give_shifts WHERE swap_id = ?', [swapId]);
    if (remaining.length === 0) {
      await dbRun("UPDATE swaps SET status = 'completed' WHERE id = ?", [swapId]);
    }
  }

  // 5) record the completed swap and mark the offer agreed (permanent note)
  await dbRun(
    `INSERT INTO completed_swaps
       (id, swap_id_1, swap_id_2, registrar_1_id, registrar_2_id,
        registrar_1_gives_date, registrar_1_gives_shift,
        registrar_2_gives_date, registrar_2_gives_shift)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [generateId(), swap_id_1, swap_id_2, registrar_1_id, registrar_2_id,
     give1_date, give1_shift, give2_date, give2_shift]
  );
  await dbRun("UPDATE swap_offers SET status = 'agreed' WHERE id = ?", [offer.id]);
};

// GET /api/offers/inbox — pending + agreed offers for the current user, their perspective
router.get('/inbox', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const offers = await dbAll(
      `SELECT o.*, r1.name AS reg1_name, r2.name AS reg2_name
       FROM swap_offers o
       JOIN registrars r1 ON o.registrar_1_id = r1.id
       JOIN registrars r2 ON o.registrar_2_id = r2.id
       WHERE (o.registrar_1_id = ? OR o.registrar_2_id = ?)
         AND o.status IN ('pending','agreed')
       ORDER BY o.created_at DESC`,
      [userId, userId]
    );

    const view = offers.map(o => {
      const isReg1 = o.registrar_1_id === userId;
      return {
        id: o.id,
        status: o.status,
        youGive: isReg1 ? { date: o.give1_date, shift: o.give1_shift } : { date: o.give2_date, shift: o.give2_shift },
        youReceive: isReg1 ? { date: o.give2_date, shift: o.give2_shift } : { date: o.give1_date, shift: o.give1_shift },
        otherName: isReg1 ? o.reg2_name : o.reg1_name,
        youAccepted: isReg1 ? !!o.reg1_accepted : !!o.reg2_accepted,
        otherAccepted: isReg1 ? !!o.reg2_accepted : !!o.reg1_accepted,
        createdAt: o.created_at
      };
    });

    res.json(view);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// POST /api/offers/:id/accept
router.post('/:id/accept', verifyToken, async (req, res) => {
  try {
    const offer = await dbGet('SELECT * FROM swap_offers WHERE id = ?', [req.params.id]);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    const role = partyRole(offer, req.user.id);
    if (!role) return res.status(403).json({ error: 'Not authorized' });
    if (offer.status !== 'pending') return res.status(400).json({ error: 'Offer is no longer pending' });

    const col = role === 1 ? 'reg1_accepted' : 'reg2_accepted';
    await dbRun(`UPDATE swap_offers SET ${col} = 1 WHERE id = ?`, [offer.id]);

    const updated = await dbGet('SELECT * FROM swap_offers WHERE id = ?', [offer.id]);
    if (updated.reg1_accepted && updated.reg2_accepted) {
      await finalizeOffer(updated);
      return res.json({ message: 'Swap agreed', status: 'agreed' });
    }
    res.json({ message: 'Acceptance recorded, waiting for the other registrar', status: 'pending' });
  } catch (error) {
    console.error('Error accepting offer:', error);
    res.status(500).json({ error: 'Failed to accept offer' });
  }
});

// POST /api/offers/:id/decline
router.post('/:id/decline', verifyToken, async (req, res) => {
  try {
    const offer = await dbGet('SELECT * FROM swap_offers WHERE id = ?', [req.params.id]);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    if (!partyRole(offer, req.user.id)) return res.status(403).json({ error: 'Not authorized' });
    if (offer.status !== 'pending') return res.status(400).json({ error: 'Offer is no longer pending' });

    await dbRun("UPDATE swap_offers SET status = 'declined' WHERE id = ?", [offer.id]);
    res.json({ message: 'Offer declined' });
  } catch (error) {
    console.error('Error declining offer:', error);
    res.status(500).json({ error: 'Failed to decline offer' });
  }
});

module.exports = router;
