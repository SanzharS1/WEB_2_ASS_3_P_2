const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const logger = require('./middleware/logger');
const workoutsRouter = require('./routes/workouts');
const authRouter = require('./routes/auth');

const app = express();

// Middlewares
app.use(logger);
app.use(express.static('public'));
app.use(express.json());

// Sessions (cookie-based)
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    dbName: process.env.MONGO_DB || 'fitlife',
    collectionName: 'sessions',
  }),
  cookie: {
    httpOnly: true,                 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24    
  }
}));

// UI pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Auth API
app.use('/api/auth', authRouter);

// Workouts API
app.use('/api/workouts', workoutsRouter);

app.get('/api/info', (req, res) => {
  res.json({
    project: 'FitLife Tracker',
    assignment: 'Assignment 4 (Sessions & Security)',
    protectedWrites: true,
    time: new Date().toISOString()
  });
});

// API 404
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// UI 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

module.exports = app;
