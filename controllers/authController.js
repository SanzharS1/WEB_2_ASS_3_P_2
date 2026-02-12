const bcrypt = require('bcrypt');
const { getDb } = require('../database/mongo');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').toLowerCase());
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const db = await getDb();
    const user = await db.collection('users').findOne({ email: String(email).toLowerCase() });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.userId = String(user._id);
    req.session.email = user.email;
    req.session.role = user.role || 'user';
    req.session.name = user.name || '';

    return res.status(200).json({
      message: 'Logged in',
      email: user.email,
      role: req.session.role,
      name: req.session.name,
    });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('sid');
    return res.status(200).json({ message: 'Logged out' });
  });
}

function me(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(200).json({ authenticated: false });
  }
  return res.status(200).json({
    authenticated: true,
    email: req.session.email,
    role: req.session.role,
    name: req.session.name,
  });
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = await getDb();
    const users = db.collection('users');

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const doc = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'user',
      createdAt: new Date(),
    };

    const result = await users.insertOne(doc);

    // auto-login session
    req.session.userId = String(result.insertedId);
    req.session.email = doc.email;
    req.session.role = doc.role;
    req.session.name = doc.name;

    return res.status(201).json({
      message: 'Registered and logged in',
      email: doc.email,
      role: doc.role,
      name: doc.name,
    });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { login, logout, me, register };
