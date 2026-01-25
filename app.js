const express = require('express');
const path = require('path');

const logger = require('./middleware/logger');
const workoutsRouter = require('./routes/workouts');

const app = express();

// Middlewares
app.use(logger);
app.use(express.static('public'));
app.use(express.json());

// UI pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// API
app.use('/api/workouts', workoutsRouter);

app.get('/api/info', (req, res) => {
  res.json({
    project: 'FitLife Tracker',
    assignment: 'Assignment 3 Part 2',
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
