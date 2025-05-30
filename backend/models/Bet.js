const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  side: { type: String, enum: ['for', 'against'], required: true },
  event: { type: String, enum: ['dunk', 'marathon'], required: true },
  message: { type: String }, // optional
    status: { type: String, enum: ['paid', 'pending'], default: 'pending' }, 
  createdAt: { type: Date, default: Date.now }
});

const Bet = mongoose.model('Bet', BetSchema);

module.exports = Bet;
