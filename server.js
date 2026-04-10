const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_yourfullkeyhere');

const app = express();

// ── Stripe webhook needs raw body ─────────────────────────────────────────────
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Sessions ─────────────────────────────────────────────────────────────────
const sessions = [
  { id: '1', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon Apr 28', time: '5:30 PM – 6:30 PM',  taken: 0, total: 6 },
  { id: '2', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon Apr 28', time: '6:30 PM – 7:30 PM',  taken: 0, total: 6 },
  { id: '3', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Fri May 1',  time: '5:30 PM – 6:30 PM',  taken: 0, total: 6 },
  { id: '4', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 3',  time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '5', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 3',  time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  { id: '6', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 3',  time: '1:00 PM – 2:00 PM',   taken: 0, total: 6 },
  { id: '7', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 3',  time: '2:00 PM – 3:00 PM',   taken: 0, total: 6 },
];

// ── Email transporter ─────────────────────────────────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

async function sendConfirmationEmail({ session, parentName, kidName, kidAge, contactInfo, notes }) {
  const spotsLeft = session.total - session.taken;
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"First Play Sports" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `⚾ Paid Booking — ${session.day} ${session.time}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
        <div style="background:#1B3A6B;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:#fff;margin:0;">⚾ New Paid Booking</h2>
          <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;">Payment confirmed via Stripe</p>
        </div>
        <div style="background:#f5f7fa;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
          <h3 style="margin:0 0 16px;color:#1B3A6B;">Session Details</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:8px 0;color:#555;width:140px;">Session</td><td style="padding:8px 0;font-weight:600;">${session.name}</td></tr>
            <tr><td style="padding:8px 0;color:#555;">Date</td><td style="padding:8px 0;font-weight:600;">${session.day}</td></tr>
            <tr><td style="padding:8px 0;color:#555;">Time</td><td style="padding:8px 0;font-weight:600;">${session.time}</td></tr>
            <tr><td style="padding:8px 0;color:#555;">Spots left</td><td style="padding:8px 0;font-weight:600;color:${spotsLeft <= 1 ? '#B22234' : '#2d7a4f'};">${spotsLeft} of ${session.total}</td></tr>
          </table>
          <h3 style="margin:0 0 16px;color:#1B3A6B;">Family Info</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#555;width:140px;">Parent</td><td style="padding:8px 0;font-weight:600;">${parentName}</td></tr>
            <tr><td style="padding:8px 0;color:#555;">Child</td><td style="padding:8px 0;font-weight:600;">${kidName}, age ${kidAge}</td></tr>
            <tr><td style="padding:8px 0;color:#555;">Contact</td><td style="padding:8px 0;font-weight:600;">${contactInfo}</td></tr>
            ${notes ? `<tr><td style="padding:8px 0;color:#555;vertical-align:top;">Notes</td><td style="padding:8px 0;">${notes}</td></tr>` : ''}
          </table>
          <div style="margin-top:24px;padding:14px 16px;background:#d4edda;border-radius:6px;border-left:4px solid #2d7a4f;">
            <strong>Payment received — no action needed.</strong> ${kidName}'s spot is confirmed for ${session.day}.
          </div>
        </div>
      </div>
    `,
  });
}

// ── GET /api/slots ────────────────────────────────────────────────────────────
app.get('/api/slots', (req, res) => {
  res.json(sessions);
});

// ── POST /api/book — create Stripe Checkout session ───────────────────────────
app.post('/api/book', async (req, res) => {
  const { sessionId, parentName, kidName, kidAge, contactInfo, notes } = req.body;

  if (!sessionId || !parentName || !kidName || !kidAge || !contactInfo) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const session = sessions.find(s => s.id === String(sessionId));
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  if (session.taken >= session.total) {
    return res.status(409).json({ error: 'Sorry, this session is now full.' });
  }

  try {
    console.log("Stripe key loaded:", !!process.env.STRIPE_SECRET_KEY);
    console.log("Price ID:", process.env.STRIPE_PRICE_ID);
    const baseUrl = process.env.BASE_URL || `https://${req.headers.host}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1TKVQGJy1rlznfc2FhByhuY6',
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: contactInfo.includes('@') ? contactInfo : undefined,
      metadata: {
        sessionId,
        parentName,
        kidName,
        kidAge,
        contactInfo,
        notes: notes || '',
      },
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#schedule`,
    });

    res.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Stripe error FULL:', JSON.stringify(err));
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
});

// ── POST /webhook — Stripe confirms payment ────────────────────────────────────
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
    const checkoutSession = event.data.object;
    const { sessionId, parentName, kidName, kidAge, contactInfo, notes } = checkoutSession.metadata;

    const session = sessions.find(s => s.id === String(sessionId));
    if (session && session.taken < session.total) {
      session.taken += 1;
      try {
        await sendConfirmationEmail({ session, parentName, kidName, kidAge, contactInfo, notes });
      } catch (err) {
        console.error('Email error after payment:', err.message);
      }
    }
  }

  res.json({ received: true });
});

// ── Catch-all: serve index.html ───────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`First Play Sports running on port ${PORT}`));
