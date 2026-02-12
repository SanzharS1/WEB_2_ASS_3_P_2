const { ObjectId } = require('mongodb');
const { getDb } = require('../database/mongo');

async function requireOwnerOrAdmin(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // admin может всё
    if (req.session.role === 'admin') return next();

    const workoutId = req.params.id;
    if (!ObjectId.isValid(workoutId)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const db = await getDb();
    const workout = await db.collection('workouts').findOne({
      _id: new ObjectId(workoutId),
      userId: new ObjectId(req.session.userId),
    });

    if (!workout) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = requireOwnerOrAdmin;
