const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sessions = [
  { id: '1', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon Apr 28', time: '5:30 PM – 6:30 PM', taken: 0, total: 6 },
  { id: '2', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon Apr 28', time: '6:30 PM – 7:30 PM', taken: 0, total: 6 },
  { id: '3', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Fri May 1',  time: '5:30 PM – 6:30 PM', taken: 0, total: 6 },
  { id: '4', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 3',  time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '5', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 3',  time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  { id: '6', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 3',  time: '1:00 PM – 2:00 PM',   taken: 0, total: 6 },
  { id: '7', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 3',  time: '2:00 PM – 3:00 PM',   taken: 0, total: 6 },
];

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

app.get('/api/slots', (req, res) => {
  res.json(sessions);
});

app.post('/api/book', async (req, res) => {
  const { sessionId, parentName, kidName, kidAge, contactInfo, notes } = req.body;

  if (!sessionId || !parentName || !kidName || !kidAge || !contactInfo) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const session = sessions.find(s => s.id === String(sessionId));
  if (!session) return res.status(404).json({ error: 'Session not found.' });
  if (session.taken >= session.total) return res.status(409).json({ error: 'Sorry, this session is now full.' });

  session.taken += 1;
  const spotsLeft = session.total - session.taken;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"First Play Sports" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `⚾ New Booking — ${session.day} ${session.time}`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
        <div style="background:#1B3A6B;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:#fff;margin:0;">⚾ New Booking Request</h2>
        </div>
        <div style="background:#f5f7fa;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
          <p><strong>Session:</strong> ${session.name} — ${session.day} ${session.time}</p>
          <p><strong>Spots left:</strong> ${spotsLeft} of ${session.total}</p>
          <hr/>
          <p><strong>Parent:</strong> ${parentName}</p>
          <p><strong>Child:</strong> ${kidName}, age ${kidAge}</p>
          <p><strong>Contact:</strong> ${contactInfo}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          <div style="margin-top:20px;padding:14px;background:#fff3cd;border-left:4px solid #B22234;border-radius:6px;">
            <strong>Action needed:</strong> Reply to ${contactInfo} to confirm and collect payment.
          </div>
        </div>
      </div>`,
    });
    res.json({ success: true });
  } catch (err) {
    session.taken -= 1;
    console.error('Email error:', err.message);
    res.status(500).json({ error: 'Booking failed. Please try again.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`First Play Sports running on port ${PORT}`));