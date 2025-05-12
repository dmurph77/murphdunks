const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const Bet = require('./models/Bet');
const { TwitterApi } = require('twitter-api-v2');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Special raw body parser for Stripe Webhook
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// THEN normal middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Import the bets route
const betsRouter = require('./routes/api/bets');
app.use('/api/bets', betsRouter);                 

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const isLocal = process.env.NODE_ENV !== 'production';
const baseURL = isLocal ? 'http://localhost:5500' : 'https://murphdunks.com'; // or your real domain

// Create Checkout Session
app.post('/api/checkout', async (req, res) => {
  const { amount, side, event, firstName, lastName, email, venmoHandle, message, tweetConsent} = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${side.toUpperCase()} - ${event.toUpperCase()} bet`,
              description: `Bet placed by ${firstName} ${lastName}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${baseURL}/success.html`,
      cancel_url: `${baseURL}/cancel.html`,
      customer_email: email, // optional, but nice!
      metadata: {
        side,
        event,
        firstName,
        lastName,
        venmoHandle,
        message,
        tweetConsent 
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Something went wrong creating Stripe checkout.' });
  }
});

// Stripe Webhook Endpoint
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📢 Stripe event type:', event.type);

  if (event.type === 'checkout.session.completed') {

    const session = event.data.object;

    // Save bet to MongoDB from metadata
    const newBet = new Bet({
      amount: session.amount_total / 100,
      side: session.metadata.side,
      event: session.metadata.event,
      firstName: session.metadata.firstName,
      lastName: session.metadata.lastName,
      email: session.customer_email,
      venmoHandle: session.metadata.venmoHandle,
      message: session.metadata.message,
      status: 'paid',
      createdAt: new Date()
    });

    await newBet.save();
    console.log('✅ Bet saved from successful Stripe payment!');

    // ✅ New: Only Tweet if user consented
    if (session.metadata.tweetConsent === 'true') {
      try {
        const firstName = session.metadata.firstName;
        const lastInitial = session.metadata.lastName[0] || '';
        const side = session.metadata.side.toUpperCase();
        const eventName = session.metadata.event.toUpperCase();
    
        // Clip the message if it's too long
        let message = session.metadata.message || '';
        if (message.length > 120) {
          message = message.substring(0, 117) + '...';
        }
    
        const tweetText = `${firstName} ${lastInitial}. just bet ${side} Murph to ${eventName}! 🏀 Message: "${message}" #MurphDunks`;
    
        await twitterClient.v2.tweet(tweetText);
        console.log('✅ Tweet posted!');
      } catch (err) {
        console.error('⚠️ Error posting tweet:', err.message);
      }
    }
  }

  res.json({ received: true });
});

