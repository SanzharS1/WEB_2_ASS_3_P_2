const express = require('express');
const bcrypt = require('bcrypt');
const { getDb } = require('../database/mongo');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid credentials' }); 
    }

    const db = await getDb();
    const user = await db.collection('users').findOne({ email: String(email).toLowerCase() });

    // generic error (no leaks)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Create session
    req.session.userId = String(user._id);
    req.session.email = user.email; 

    return res.status(200).json({ message: 'Logged in', email: user.email });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    return res.status(200).json({ message: 'Logged out' });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(200).json({ authenticated: false });
  }
  return res.status(200).json({
    authenticated: true,
    email: req.session.email
  });
});

module.exports = router;
