const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_yourfullkeyhere');

const app = express();

// — Stripe webhook needs raw body ————————————————————————————
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// — Sessions ————————————————————————————————————————————————
const sessions = [
  // --- Sat Apr 25 ---
  { id: '1',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat Apr 25', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '2',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat Apr 25', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '3',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat Apr 25', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  { id: '4',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat Apr 25', time: '1:00 PM – 2:00 PM',   taken: 0, total: 6 },
  { id: '5',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat Apr 25', time: '2:00 PM – 3:00 PM',   taken: 0, total: 6 },
  // --- Sun Apr 26 ---
  { id: '6',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun Apr 26', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '7',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun Apr 26', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '8',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun Apr 26', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
];


// — Email transporter ————————————————————————————————————————
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// — Routes ————————————————————————————————————————————————————

// Get all slots
app.get('/api/slots', (req, res) => {
  res.json(sessions);
});

// Create Stripe checkout session
app.post('/api/book', async (req, res) => {
  const { sessionId, parentName, kidName, kidAge, contactInfo, notes } = req.body;

  const session = sessions.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.taken >= session.total) return res.status(400).json({ error: 'Session is full' });

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${session.name} — ${session.day} ${session.time}`,
              description: `Coach Mark · First Play Sports · Kid: ${kidName} (age ${kidAge})`,
            },
            unit_amount: 2200, // $22.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.BASE_URL || 'https://firstplaysports.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL || 'https://firstplaysports.com'}/#schedule`,
      metadata: {
        sessionId,
        parentName,
        kidName,
        kidAge,
        contactInfo,
        notes: notes || '',
      },
    });

    res.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Payment setup failed. Please try again.' });
  }
});

// Stripe webhook — fires after successful payment
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const data = event.data.object;
    const { sessionId, parentName, kidName, kidAge, contactInfo, notes } = data.metadata;

    // Mark spot as taken
    const session = sessions.find(s => s.id === sessionId);
    if (session) session.taken += 1;

    // Send confirmation email to Mark
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'firstplaysportswv@gmail.com',
        subject: `New Booking: ${kidName} — ${session ? session.day : sessionId}`,
        text: `New booking received!\n\nParent: ${parentName}\nKid: ${kidName} (age ${kidAge})\nContact: ${contactInfo}\nSession: ${session ? session.day + ' ' + session.time : sessionId}\nNotes: ${notes || 'None'}\n\nAmount paid: $22.00`,
      });
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }
  }

  res.json({ received: true });
});

// — Start server ————————————————————————————————————————————
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`First Play Sports server running on port ${PORT}`));
