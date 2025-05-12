const express = require('express');
const router = express.Router();
const Bet = require('../../models/Bet');

// POST /api/bets
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, amount, side, event, message } = req.body;

    const newBet = new Bet({
      firstName,
      lastName,
      email,
      amount,
      side,
      event,
      message
    });

    await newBet.save();
    res.status(201).json({ success: true, bet: newBet });
  } catch (err) {
    console.error('Error saving bet:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// GET /api/bets - Fetch all bets and calculate totals
router.get('/', async (req, res) => {
  try {
    const bets = await Bet.find().sort({ createdAt: -1 });

    // Initialize stats
    const stats = {
      dunk: { for: 0, against: 0, impliedOdds: 0 },
      marathon: { for: 0, against: 0, impliedOdds: 0 },
      totalBets: 0,
      charityAmount: 0
    };

    // Calculate totals
    bets.forEach(bet => {
      if (bet.event === 'dunk') {
        if (bet.side === 'for') {
          stats.dunk.for += bet.amount;
        } else {
          stats.dunk.against += bet.amount;
        }
      } else if (bet.event === 'marathon') {
        if (bet.side === 'for') {
          stats.marathon.for += bet.amount;
        } else {
          stats.marathon.against += bet.amount;
        }
      }
      stats.totalBets += bet.amount;
    });

    // Calculate implied odds (guard against division by zero)
    stats.dunk.impliedOdds = stats.dunk.for + stats.dunk.against > 0
      ? stats.dunk.for / (stats.dunk.for + stats.dunk.against)
      : 0;

    stats.marathon.impliedOdds = stats.marathon.for + stats.marathon.against > 0
      ? stats.marathon.for / (stats.marathon.for + stats.marathon.against)
      : 0;

    // Calculate charity amount (20% of total bets)
    stats.charityAmount = stats.totalBets * 0.20;

    // Send bets + stats
    res.status(200).json({ success: true, bets, stats });

  } catch (err) {
    console.error('Error fetching bets:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;

