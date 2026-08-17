const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const WAITLIST_FILE = path.join(__dirname, 'data', 'waitlist.json');

app.use(express.json());
app.use(express.static('public'));

function ensureDataDir() {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(WAITLIST_FILE)) fs.writeFileSync(WAITLIST_FILE, '[]');
}

function getWaitlist() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(WAITLIST_FILE, 'utf8'));
}

function saveWaitlist(list) {
  ensureDataDir();
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify(list, null, 2));
}

app.post('/api/waitlist', (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const waitlist = getWaitlist();

  if (waitlist.some(entry => entry.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'This email is already on the waitlist.' });
  }

  waitlist.push({
    email: email.toLowerCase().trim(),
    joinedAt: new Date().toISOString(),
    position: waitlist.length + 1
  });

  saveWaitlist(waitlist);

  res.json({
    message: 'You\'re on the list!',
    position: waitlist.length
  });
});

app.get('/api/waitlist/count', (_req, res) => {
  const waitlist = getWaitlist();
  res.json({ count: waitlist.length });
});

app.listen(PORT, () => {
  console.log(`OddsOracle server running on http://localhost:${PORT}`);
});
