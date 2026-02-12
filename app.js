const express = require('express');
const path = require('path');

const logger = require('./middleware/logger');
const { buildSessionMiddleware } = require('./config/sessions');

const workoutsRouter = require('./routes/workouts');
const authRouter = require('./routes/auth');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(logger);
app.use(express.static('public'));
app.use(express.json());

app.use(buildSessionMiddleware());

// UI pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// API
app.use('/api/auth', authRouter);
app.use('/api/workouts', workoutsRouter);

app.get('/api/info', (req, res) => {
  res.json({
    project: 'FitLife Tracker',
    stage: 'Final Project (Production Web Application)',
    auth: 'Sessions + bcrypt',
    roles: ['user', 'admin'],
    security: {
      protectedWrites: true,
      ownerAccess: true,
      roleBasedAccess: true,
      httpOnlyCookie: true,
      envSecrets: true,
      pagination: true,
    },
    time: new Date().toISOString(),
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
