// server.js
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

// VAPID config
webpush.setVapidDetails(
  'mailto:' + (process.env.EMAIL_FROM || 'you@example.com'),
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

// Simple in-memory storage (replace with DB for production)
const SUBSCRIPTIONS = [];
const EMAILS = []; // { email, name }

app.post('/api/subscribe', (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ error: 'no subscription' });
  SUBSCRIPTIONS.push(subscription);
  res.json({ success: true });
});

app.post('/api/register-email', (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  EMAILS.push({ email, name });
  res.json({ success: true });
});

app.post('/api/send-push', async (req, res) => {
  const payload = req.body.payload || { title: 'Tracker', body: 'Daily reminder' };
  const results = [];
  await Promise.all(SUBSCRIPTIONS.map(async (sub) => {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
      results.push({ ok: true });
    } catch (e) {
      results.push({ ok: false, e: e.message });
    }
  }));
  res.json({ results });
});

// nodemailer transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

async function sendDailyEmails() {
  for (const recipient of EMAILS) {
    const html = `<p>Assalamualaikum ${recipient.name || ''},</p><p>Here's your daily reminder to stay strong. Open your tracker: <a href="${process.env.APP_URL || 'http://localhost:3000'}">Open tracker</a></p>`;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: recipient.email,
        subject: 'Daily Clean-Tracker Reminder',
        html
      });
    } catch (err) {
      console.error('Email error', err && err.message);
    }
  }
}

// Cron job: every day at 21:00 server time
cron.schedule('0 21 * * *', () => {
  console.log('Running daily job: sending push + emails');
  const payload = { title: 'Daily Reminder', body: 'Stay strong — open your 82-day tracker.' };
  SUBSCRIPTIONS.forEach(sub => { webpush.sendNotification(sub, JSON.stringify(payload)).catch(e=>console.error('push err',e.message)); });
  sendDailyEmails();
});

app.listen(PORT, () => console.log('Server running on port', PORT));
