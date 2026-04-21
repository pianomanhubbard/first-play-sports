const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use((req, res, next) => {
  const blocked = ['/server.js', '/package.json', '/package-lock.json', '/render.yaml'];
  if (blocked.includes(req.path)) return res.status(404).send('Not found');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const sessions = [
  // --- Sat Apr 25 ---
  { id: '1',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat Apr 25', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '2',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat Apr 25', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '3',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat Apr 25', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  // --- Sun Apr 26 ---
  { id: '4',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun Apr 26', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '5',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun Apr 26', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '6',  sport: 'football', icon: '🏈', name: 'Flag Football',   day: 'Sun Apr 26', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  // --- Mon Apr 27 ---
  { id: '7',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon Apr 27', time: '6:00 PM – 7:00 PM',   taken: 0, total: 6 },
  { id: '8',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon Apr 27', time: '7:00 PM – 8:00 PM',   taken: 0, total: 6 },
];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.get('/api/slots', (req, res) => {
  res.json(sessions);
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.post('/api/book', async (req, res) => {
  const { sessionId, parentName, kidName, kidAge, contactInfo, notes } = req.body;
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.taken >= session.total) return res.status(400).json({ error: 'Session is full' });
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${session.name} — ${session.day} ${session.time}`,
            description: `Coach Mark · First Play Sports · Kid: ${kidName} (age ${kidAge})`,
          },
          unit_amount: 2000,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL || 'https://firstplaysports.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL || 'https://firstplaysports.com'}/#schedule`,
      metadata: { sessionId, parentName, kidName, kidAge, contactInfo, notes: notes || '' },
    });
    res.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Payment setup failed. Please try again.' });
  }
});

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
    const session = sessions.find(s => s.id === sessionId);
    if (session) session.taken += 1;
    const sessionDetails = session ? `${session.name} — ${session.day} ${session.time}` : sessionId;
    const emailAddress = contactInfo ? contactInfo.split(' /')[0].trim() : null;

    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: 'firstplaysportswv@gmail.com',
        subject: `New Booking: ${kidName} — ${session ? session.day : sessionId}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#002147;padding:20px;text-align:center;">
              <h2 style="color:#FFD23F;margin:0;">New Booking Received!</h2>
            </div>
            <div style="padding:24px;background:#f9f9f9;">
              <p style="font-size:16px;"><strong>Parent:</strong> ${parentName}</p>
              <p style="font-size:16px;"><strong>Kid:</strong> ${kidName} (age ${kidAge})</p>
              <p style="font-size:16px;"><strong>Contact:</strong> ${contactInfo}</p>
              <p style="font-size:16px;"><strong>Session:</strong> ${sessionDetails}</p>
              <p style="font-size:16px;"><strong>Notes:</strong> ${notes || 'None'}</p>
              <p style="font-size:16px;"><strong>Amount paid:</strong> $20.00</p>
            </div>
          </div>`,
        text: `New booking!\n\nParent: ${parentName}\nKid: ${kidName} (age ${kidAge})\nContact: ${contactInfo}\nSession: ${sessionDetails}\nNotes: ${notes || 'None'}\nAmount paid: $20.00`,
      });
      console.log('Coach Mark email sent successfully');
    } catch (emailErr) {
      console.error('Coach Mark email error:', emailErr.message);
    }

    if (emailAddress && emailAddress.includes('@')) {
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: emailAddress,
          subject: `You're booked! First Play Sports — ${session ? session.day : ''}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#002147;padding:20px;text-align:center;">
                <h2 style="color:#FFD23F;margin:0;">You're Booked! ⚾</h2>
                <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">First Play Sports</p>
              </div>
              <div style="padding:24px;background:#f9f9f9;">
                <p style="font-size:16px;">Hi ${parentName},</p>
                <p style="font-size:16px;">You're all set! Here are your booking details:</p>
                <div style="background:#fff;border-left:4px solid #B22234;padding:16px;margin:16px 0;border-radius:4px;">
                  <p style="margin:4px 0;font-size:15px;"><strong>Kid:</strong> ${kidName} (age ${kidAge})</p>
                  <p style="margin:4px 0;font-size:15px;"><strong>Session:</strong> ${sessionDetails}</p>
                  <p style="margin:4px 0;font-size:15px;"><strong>Coach:</strong> Coach Mark Lucas</p>
                  <p style="margin:4px 0;font-size:15px;"><strong>Location:</strong> Huntfield Community Grass Park · Front of neighborhood by the dome · Charles Town, WV</p>
                  <p style="margin:4px 0;font-size:15px;"><strong>Amount paid:</strong> $20.00</p>
                </div>
                <p style="font-size:15px;">Just bring ${kidName} in comfortable clothes and sneakers — Coach Mark handles everything else.</p>
                <p style="font-size:15px;">Questions? Reach Coach Mark at <a href="mailto:firstplaysportswv@gmail.com">firstplaysportswv@gmail.com</a> or (724) 799-4778.</p>
                <p style="font-size:15px;">See you on the field!<br><strong>— Coach Mark</strong><br>First Play Sports</p>
              </div>
            </div>`,const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use((req, res, next) => {
  const blocked = ['/server.js', '/package.json', '/package-lock.json', '/render.yaml'];
  if (blocked.includes(req.path)) return res.status(404).send('Not found');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const sessions = [
  { id: '1',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat Apr 25', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '2',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat Apr 25', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '3',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat Apr 25', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  { id: '4',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun Apr 26', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '5',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun Apr 26', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '6',  sport: 'football', icon: '🏈', name: 'Flag Football',   day: 'Sun Apr 26', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  { id: '7',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon Apr 27', time: '6:00 PM – 7:00 PM',   taken: 0, total: 6 },
  { id: '8',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon Apr 27', time: '7:00 PM – 8:00 PM',   taken: 0, total: 6 },
];

const reviews = [
  { id: 'r1', name: 'Sarah M.', sport: 'baseball', rating: 5, comment: 'Coach Mark was incredible with my 5-year-old. She had never held a bat before and by the end of the hour she was making contact every swing. We will definitely be back!', date: 'April 2025' },
  { id: 'r2', name: 'James T.', sport: 'baseball', rating: 5, comment: 'My son is 7 and was nervous before the session. Coach Mark had him laughing within the first five minutes. Real coaching, real patience. Worth every penny.', date: 'April 2025' },
  { id: 'r3', name: 'Danielle R.', sport: 'football', rating: 5, comment: "We brought four kids from the neighborhood and it was the best Saturday morning we've had all spring. Coach Mark keeps every kid engaged the whole time.", date: 'April 2025' },
];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.get('/api/slots', (req, res) => {
  res.json(sessions);
});

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { name, sport, rating, comment } = req.body;
  if (!name || !rating || !comment) {
    return res.status(400).json({ error: 'Name, rating, and comment are required.' });
  }
  const ratingNum = parseInt(rating, 10);
  if (ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }
  const now = new Date();
  const review = {
    id: Date.now().toString(),
    name: name.trim(),
    sport: sport || 'general',
    rating: ratingNum,
    comment: comment.trim(),
    date: now.toLocaleString('default', { month: 'long' }) + ' ' + now.getFullYear(),
  };
  reviews.push(review);
  res.json({ success: true, review });
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.post('/api/book', async (req, res) => {
  const { sessionId, parentName, kidName, kidAge, contactInfo, notes } = req.body;
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.taken >= session.total) return res.status(400).json({ error: 'Session is full' });
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${session.name} — ${session.day} ${session.time}`,
            description: `Coach Mark · First Play Sports · Kid: ${kidName} (age ${kidAge})`,
          },
          unit_amount: 2000,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL || 'https://firstplaysports.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL || 'https://firstplaysports.com'}/#schedule`,
      metadata: { sessionId, parentName, kidName, kidAge, contactInfo, notes: notes || '' },
    });
    res.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Payment setup failed. Please try again.' });
  }
});

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
    const session = sessions.find(s => s.id === sessionId);
    if (session) session.taken += 1;
    const sessionDetails = session ? `${session.name} — ${session.day} ${session.time}` : sessionId;
    const emailAddress = contactInfo ? contactInfo.split(' /')[0].trim() : null;

    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: 'firstplaysportswv@gmail.com',
        subject: `New Booking: ${kidName} — ${session ? session.day : sessionId}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#002147;padding:20px;text-align:center;"><h2 style="color:#FFD23F;margin:0;">New Booking Received!</h2></div><div style="padding:24px;background:#f9f9f9;"><p style="font-size:16px;"><strong>Parent:</strong> ${parentName}</p><p style="font-size:16px;"><strong>Kid:</strong> ${kidName} (age ${kidAge})</p><p style="font-size:16px;"><strong>Contact:</strong> ${contactInfo}</p><p style="font-size:16px;"><strong>Session:</strong> ${sessionDetails}</p><p style="font-size:16px;"><strong>Notes:</strong> ${notes || 'None'}</p><p style="font-size:16px;"><strong>Amount paid:</strong> $20.00</p></div></div>`,
        text: `New booking!\n\nParent: ${parentName}\nKid: ${kidName} (age ${kidAge})\nContact: ${contactInfo}\nSession: ${sessionDetails}\nNotes: ${notes || 'None'}\nAmount paid: $20.00`,
      });
      console.log('Coach Mark email sent successfully');
    } catch (emailErr) {
      console.error('Coach Mark email error:', emailErr.message);
    }

    if (emailAddress && emailAddress.includes('@')) {
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: emailAddress,
          subject: `You're booked! First Play Sports — ${session ? session.day : ''}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#002147;padding:20px;text-align:center;"><h2 style="color:#FFD23F;margin:0;">You're Booked! ⚾</h2><p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">First Play Sports</p></div><div style="padding:24px;background:#f9f9f9;"><p style="font-size:16px;">Hi ${parentName},</p><p style="font-size:16px;">You're all set! Here are your booking details:</p><div style="background:#fff;border-left:4px solid #B22234;padding:16px;margin:16px 0;border-radius:4px;"><p style="margin:4px 0;font-size:15px;"><strong>Kid:</strong> ${kidName} (age ${kidAge})</p><p style="margin:4px 0;font-size:15px;"><strong>Session:</strong> ${sessionDetails}</p><p style="margin:4px 0;font-size:15px;"><strong>Coach:</strong> Coach Mark Lucas</p><p style="margin:4px 0;font-size:15px;"><strong>Location:</strong> Huntfield Community Grass Park · Front of neighborhood by the dome · Charles Town, WV</p><p style="margin:4px 0;font-size:15px;"><strong>Amount paid:</strong> $20.00</p></div><p style="font-size:15px;">Just bring ${kidName} in comfortable clothes and sneakers — Coach Mark handles everything else.</p><p style="font-size:15px;">Questions? Reach Coach Mark at <a href="mailto:firstplaysportswv@gmail.com">firstplaysportswv@gmail.com</a> or (724) 799-4778.</p><p style="font-size:15px;">See you on the field!<br><strong>— Coach Mark</strong><br>First Play Sports</p></div></div>`,
          text: `Hi ${parentName},\n\nYou're all set!\n\nKid: ${kidName} (age ${kidAge})\nSession: ${sessionDetails}\nCoach: Coach Mark Lucas\nLocation: Huntfield Community Grass Park · Charles Town, WV\nAmount paid: $20.00\n\nJust bring ${kidName} in comfortable clothes and sneakers — Coach Mark handles everything else.\n\nQuestions? firstplaysportswv@gmail.com or (724) 799-4778\n\nSee you on the field!\n— Coach Mark\nFirst Play Sports`,
        });
        console.log('Parent confirmation email sent to:', emailAddress);
      } catch (emailErr) {
        console.error('Parent email error:', emailErr.message);
      }
    } else {
      console.warn('No valid parent email found in contactInfo:', contactInfo);
    }
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`First Play Sports server running on port ${PORT}`));
          text: `Hi ${parentName},\n\nYou're all set!\n\nKid: ${kidName} (age ${kidAge})\nSession: ${sessionDetails}\nCoach: Coach Mark Lucas\nLocation: Huntfield Community Grass Park · Charles Town, WV\nAmount paid: $20.00\n\nJust bring ${kidName} in comfortable clothes and sneakers — Coach Mark handles everything else.\n\nQuestions? firstplaysportswv@gmail.com or (724) 799-4778\n\nSee you on the field!\n— Coach Mark\nFirst Play Sports`,
        });
        console.log('Parent confirmation email sent to:', emailAddress);
      } catch (emailErr) {
        console.error('Parent email error:', emailErr.message);
      }
    } else {
      console.warn('No valid parent email found in contactInfo:', contactInfo);
    }
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`First Play Sports server running on port ${PORT}`));
