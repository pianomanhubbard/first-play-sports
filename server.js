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
  // ============================================================
// PASTE THIS to REPLACE your existing "sessions" array
// in server.js
// ============================================================

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
  // --- Sat May 16 ---
  { id: '9',  sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 16', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '10', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 16', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '11', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 16', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  { id: '12', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 16', time: '1:00 PM – 2:00 PM',   taken: 0, total: 6 },
  { id: '13', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 16', time: '2:00 PM – 3:00 PM',   taken: 0, total: 6 },
  // --- Sun May 17 ---
  { id: '14', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 17', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '15', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 17', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '16', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 17', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  // --- Sat May 23 ---
  { id: '17', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 23', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '18', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 23', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '19', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 23', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  { id: '20', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 23', time: '1:00 PM – 2:00 PM',   taken: 0, total: 6 },
  { id: '21', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 23', time: '2:00 PM – 3:00 PM',   taken: 0, total: 6 },
  // --- Sun May 24 ---
  { id: '22', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 24', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '23', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 24', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '24', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 24', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  // --- Mon May 25 (Memorial Day) ---
  { id: '25', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon May 25', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '26', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon May 25', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '27', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon May 25', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  { id: '28', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon May 25', time: '1:00 PM – 2:00 PM',   taken: 0, total: 6 },
  { id: '29', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Mon May 25', time: '2:00 PM – 3:00 PM',   taken: 0, total: 6 },
  // --- Sat May 30 ---
  { id: '30', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 30', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '31', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 30', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '32', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 30', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
  { id: '33', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 30', time: '1:00 PM – 2:00 PM',   taken: 0, total: 6 },
  { id: '34', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sat May 30', time: '2:00 PM – 3:00 PM',   taken: 0, total: 6 },
  // --- Sun May 31 ---
  { id: '35', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 31', time: '10:00 AM – 11:00 AM', taken: 0, total: 6 },
  { id: '36', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 31', time: '11:00 AM – 12:00 PM', taken: 0, total: 6 },
  { id: '37', sport: 'baseball', icon: '⚾', name: 'Baseball Basics', day: 'Sun May 31', time: '12:00 PM – 1:00 PM',  taken: 0, total: 6 },
];
