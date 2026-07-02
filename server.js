const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// — Stripe webhook needs raw body ————————————————————————————
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// — Regular Sessions ————————————————————————————————————————————————
const sessions = [];

// — Summer Sessions ————————————————————————————————————————————————
const campSessions = [
  { id: 'summer-session-morning', name: 'Morning Session', time: '9 AM – 12 PM', ages: '4–9 Years Old', level: 'All Sports', icon: '🌅', week: 'Starting July 6' },
  { id: 'summer-session-evening', name: 'Evening Session', time: '5 PM – 8 PM',  ages: '4–9 Years Old', level: 'All Sports', icon: '🌇', week: 'Starting July 6' },
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

app.get('/api/slots', (req, res) => res.json(sessions));
app.get('/api/camp-sessions', (req, res) => res.json(campSessions));

app.get('/success', (req, res) => res.sendFile(path.join(__dirname, 'public', 'success.html')));

// — Admin auth middleware ————————————————————————————————————
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'firstplay2024';
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// — Admin routes ————————————————————————————————————————————
app.post('/api/admin/verify', adminAuth, (req, res) => res.json({ ok: true }));

app.post('/api/admin/sessions', adminAuth, (req, res) => {
  const { sport, name, day, time, total } = req.body;
  if (!sport || !name || !day || !time) return res.status(400).json({ error: 'Missing required fields' });
  const icons = { baseball:'⚾', football:'🏈', basketball:'🏀', soccer:'⚽', golf:'⛳', pickleball:'🏓', volleyball:'🏐' };
  const id = String(Date.now());
  sessions.push({ id, sport, icon: icons[sport] || '🏅', name, day, time, taken: 0, total: parseInt(total) || 6 });
  res.json({ success: true, id });
});

app.delete('/api/admin/sessions/:id', adminAuth, (req, res) => {
  const idx = sessions.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Session not found' });
  sessions.splice(idx, 1);
  res.json({ success: true });
});

app.patch('/api/admin/sessions/:id', adminAuth, (req, res) => {
  const session = sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  session.taken = parseInt(req.body.taken) || 0;
  res.json({ success: true });
});

app.get('/api/reviews', (req, res) => res.json([]));
app.delete('/api/admin/reviews/:id', adminAuth, (req, res) => res.json({ success: true }));

// — Regular session booking ————————————————————————————————————
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
          unit_amount: 2500,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL || 'https://firstplaysports.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL || 'https://firstplaysports.com'}/#camp`,
      metadata: { sessionId, parentName, kidName, kidAge, contactInfo, notes: notes || '', type: 'session' },
    });
    res.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Payment setup failed. Please try again.' });
  }
});

// — Summer session booking ————————————————————————————————————
app.post('/api/book-camp', async (req, res) => {
  const { campSessionId, option, dayCount, parentName, kidName, kidAge, contactInfo, notes } = req.body;
  const campSession = campSessions.find(s => s.id === campSessionId);
  if (!campSession) return res.status(404).json({ error: 'Session not found' });

  const days = parseInt(dayCount) || 1;
  const amount = days * 2500; // $25 per day
  const label = `${days} Day${days > 1 ? 's' : ''} ($${days * 25})`;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `All-Star Sports Days — ${campSession.name}`,
            description: `Coach Mark · ${campSession.time} · Ages 4–9 · ${label} · Kid: ${kidName} (age ${kidAge})`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL || 'https://firstplaysports.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL || 'https://firstplaysports.com'}/#camp`,
      metadata: { campSessionId, option, dayCount: String(days), parentName, kidName, kidAge, contactInfo, notes: notes || '', type: 'camp' },
    });
    res.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Stripe camp error:', err.message);
    res.status(500).json({ error: 'Payment setup failed. Please try again.' });
  }
});

// — Stripe webhook ————————————————————————————————————————————
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
    const { parentName, kidName, kidAge, contactInfo, notes, type, sessionId, campSessionId, dayCount } = data.metadata;
    const emailAddress = contactInfo ? contactInfo.split(' /')[0].trim() : null;

    let sessionDetails, subjectSuffix, amountPaid;

    if (type === 'camp') {
      const cs = campSessions.find(s => s.id === campSessionId);
      const days = parseInt(dayCount) || 1;
      amountPaid = `$${days * 25}.00`;
      sessionDetails = cs ? `All-Star Sports Days — ${cs.name} (${cs.time}) — ${notes}` : campSessionId;
      subjectSuffix = cs ? cs.name : campSessionId;
    } else {
      const s = sessions.find(s => s.id === sessionId);
      if (s) s.taken += 1;
      amountPaid = '$25.00';
      sessionDetails = s ? `${s.name} — ${s.day} ${s.time}` : sessionId;
      subjectSuffix = s ? s.day : sessionId;
    }

    // Email to Coach Mark
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'firstplaysportswv@gmail.com',
        subject: `New Booking: ${kidName} — ${subjectSuffix}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#002147;padding:20px;text-align:center;">
              <h2 style="color:#ffffff;margin:0;">New Booking Received!</h2>
            </div>
            <div style="padding:24px;background:#f9f9f9;">
              <p style="font-size:16px;"><strong>Parent:</strong> ${parentName}</p>
              <p style="font-size:16px;"><strong>Kid:</strong> ${kidName} (age ${kidAge})</p>
              <p style="font-size:16px;"><strong>Contact:</strong> ${contactInfo}</p>
              <p style="font-size:16px;"><strong>Session:</strong> ${sessionDetails}</p>
              <p style="font-size:16px;"><strong>Notes:</strong> ${notes || 'None'}</p>
              <p style="font-size:16px;"><strong>Amount paid:</strong> ${amountPaid}</p>
            </div>
          </div>`,
        text: `New booking!\n\nParent: ${parentName}\nKid: ${kidName} (age ${kidAge})\nContact: ${contactInfo}\nSession: ${sessionDetails}\nNotes: ${notes || 'None'}\nAmount paid: ${amountPaid}`,
      });
    } catch (emailErr) {
      console.error('Coach Mark email error:', emailErr.message);
    }

    // Email to parent
    if (emailAddress && emailAddress.includes('@')) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailAddress,
          subject: `You're booked! Coach Mark's All-Star Sports Days`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#002147;padding:20px;text-align:center;">
                <h2 style="color:#ffffff;margin:0;">You're Booked! ⚾</h2>
                <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Coach Mark's All-Star Sports Days</p>
              </div>
              <div style="padding:24px;background:#f9f9f9;">
                <p style="font-size:16px;">Hi ${parentName},</p>
                <p style="font-size:16px;">You're all set! Here are your booking details:</p>
                <div style="background:#fff;border-left:4px solid #B22234;padding:16px;margin:16px 0;border-radius:4px;">
                  <p style="margin:4px 0;font-size:15px;"><strong>Kid:</strong> ${kidName} (age ${kidAge})</p>
                  <p style="margin:4px 0;font-size:15px;"><strong>Session:</strong> ${sessionDetails}</p>
                  <p style="margin:4px 0;font-size:15px;"><strong>Coach:</strong> Coach Mark Lucas</p>
                  <p style="margin:4px 0;font-size:15px;"><strong>Location:</strong> Huntfield Community · Beside Washington High School · Charles Town, WV</p>
                  <p style="margin:4px 0;font-size:15px;"><strong>Amount paid:</strong> ${amountPaid}</p>
                </div>
                <p style="font-size:15px;">Just bring ${kidName} in comfortable clothes and sneakers — Coach Mark handles everything else.</p>
                <p style="font-size:15px;">Questions? Reach Coach Mark at <a href="mailto:firstplaysportswv@gmail.com">firstplaysportswv@gmail.com</a> or (724) 799-4778.</p>
                <p style="font-size:15px;">See you on the field!<br><strong>— Coach Mark</strong><br>First Play Sports</p>
              </div>
            </div>`,
          text: `Hi ${parentName},\n\nYou're all set!\n\nKid: ${kidName} (age ${kidAge})\nSession: ${sessionDetails}\nCoach: Coach Mark Lucas\nLocation: Huntfield Community · Beside Washington High School · Charles Town, WV\nAmount paid: ${amountPaid}\n\nQuestions? firstplaysportswv@gmail.com or (724) 799-4778\n\nSee you on the field!\n— Coach Mark`,
        });
      } catch (emailErr) {
        console.error('Parent email error:', emailErr.message);
      }
    }
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`First Play Sports server running on port ${PORT}`));
