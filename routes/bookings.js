const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/slots — return all sessions with live booking counts
router.get('/slots', async (req, res) => {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select(`
      id, sport, icon, name, day, time_slot, total_spots,
      bookings(count)
    `)
    .order('sort_order', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const slots = sessions.map(s => ({
    id: s.id,
    sport: s.sport,
    icon: s.icon,
    name: s.name,
    day: s.day,
    time: s.time_slot,
    taken: s.bookings[0]?.count ?? 0,
    total: s.total_spots,
  }));

  res.json(slots);
});

// POST /api/book — create a booking and email Mark
router.post('/book', async (req, res) => {
  const { sessionId, parentName, kidName, kidAge, contactInfo, notes } = req.body;

  if (!sessionId || !parentName || !kidName || !kidAge || !contactInfo) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Fetch session to check capacity and get details
  const { data: session, error: sessionErr } = await supabase
    .from('sessions')
    .select('*, bookings(count)')
    .eq('id', sessionId)
    .single();

  if (sessionErr || !session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const taken = session.bookings[0]?.count ?? 0;
  if (taken >= session.total_spots) {
    return res.status(409).json({ error: 'This session is full' });
  }

  // Save booking
  const { error: bookingErr } = await supabase
    .from('bookings')
    .insert({
      session_id: sessionId,
      parent_name: parentName,
      kid_name: kidName,
      kid_age: kidAge,
      contact_info: contactInfo,
      notes: notes || null,
      status: 'pending',
    });

  if (bookingErr) return res.status(500).json({ error: bookingErr.message });

  // Email Mark
  const markEmail = process.env.COACH_EMAIL || 'mark@firststepssports.com';
  const fromEmail = process.env.RESEND_FROM || 'noreply@firststepssports.com';

  const spotsLeft = session.total_spots - taken - 1;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: markEmail,
      subject: `New Booking Request — ${kidName} for ${session.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1a2e4a;padding:24px 32px;border-radius:12px 12px 0 0;">
            <h1 style="color:#FFD23F;margin:0;font-size:1.4rem;">⚽ New Booking Request</h1>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;">First Steps Sports</p>
          </div>
          <div style="border:1px solid #e8e2d8;border-top:none;border-radius:0 0 12px 12px;padding:24px 32px;">
            <h2 style="color:#1a2e4a;margin-top:0;">${session.icon} ${session.name}</h2>
            <p style="color:#5a6a7e;">📅 ${session.day} · ${session.time_slot}</p>
            <p style="color:#2d9e5f;font-weight:700;">${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining after this booking</p>
            <hr style="border:none;border-top:1px solid #e8e2d8;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#5a6a7e;width:140px;">Parent/Guardian</td><td style="font-weight:700;color:#1a2e4a;">${parentName}</td></tr>
              <tr><td style="padding:6px 0;color:#5a6a7e;">Child's Name</td><td style="font-weight:700;color:#1a2e4a;">${kidName}</td></tr>
              <tr><td style="padding:6px 0;color:#5a6a7e;">Child's Age</td><td style="font-weight:700;color:#1a2e4a;">${kidAge}</td></tr>
              <tr><td style="padding:6px 0;color:#5a6a7e;">Contact</td><td style="font-weight:700;color:#1a2e4a;">${contactInfo}</td></tr>
              ${notes ? `<tr><td style="padding:6px 0;color:#5a6a7e;">Notes</td><td style="color:#1a2e4a;">${notes}</td></tr>` : ''}
            </table>
            <div style="background:#f0faf5;border:1px solid #c3e9d5;border-radius:8px;padding:14px;margin-top:20px;">
              <p style="margin:0;color:#1e7042;font-size:0.9rem;">
                <strong>Next step:</strong> Reply to ${contactInfo} to confirm the spot and send payment details.
              </p>
            </div>
          </div>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error('Email error:', emailErr);
    // Booking was saved — don't fail the whole request over email
  }

  res.json({ success: true, message: 'Booking request sent! Mark will follow up within 24 hours.' });
});

module.exports = router;
