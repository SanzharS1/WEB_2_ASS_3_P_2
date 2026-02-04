const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../database/mongo');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === String(id);
}

// fields validation
function validateWorkout(body) {
  const { name, duration, type, intensity, calories, date, notes, status } = body || {};

  if (!name || typeof name !== 'string') return 'Invalid name';
  if (duration === undefined || Number.isNaN(Number(duration)) || Number(duration) <= 0) return 'Invalid duration';
  if (!type || typeof type !== 'string') return 'Invalid type';

  if (!intensity || typeof intensity !== 'string') return 'Invalid intensity';
  if (calories === undefined || Number.isNaN(Number(calories)) || Number(calories) < 0) return 'Invalid calories';
  if (!date || typeof date !== 'string') return 'Invalid date';
  if (notes !== undefined && typeof notes !== 'string') return 'Invalid notes';
  if (!status || typeof status !== 'string') return 'Invalid status';

  return null;
}

/* ===================== READ (NO AUTH) ===================== */

// GET all 
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const col = db.collection('workouts');

    const filter = {};
    if (req.query.type) filter.type = String(req.query.type);

    const items = await col.find(filter).toArray();
    return res.status(200).json(items);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const db = await getDb();
    const col = db.collection('workouts');

    const item = await col.findOne({ _id: new ObjectId(id) });
    if (!item) return res.status(404).json({ error: 'Not found' });

    return res.status(200).json(item);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ===================== WRITE (AUTH REQUIRED) ===================== */

// POST create (protected)
router.post('/', requireAuth, async (req, res) => {
  try {
    const err = validateWorkout(req.body);
    if (err) return res.status(400).json({ error: err });

    const db = await getDb();
    const col = db.collection('workouts');

    const doc = {
      name: String(req.body.name),
      duration: Number(req.body.duration),
      type: String(req.body.type),
      intensity: String(req.body.intensity),
      calories: Number(req.body.calories),
      date: String(req.body.date),
      notes: String(req.body.notes || ''),
      status: String(req.body.status),
      createdAt: new Date()
    };

    const result = await col.insertOne(doc);
    return res.status(201).json({ ...doc, _id: result.insertedId });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT update (protected)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const err = validateWorkout(req.body);
    if (err) return res.status(400).json({ error: err });

    const db = await getDb();
    const col = db.collection('workouts');

    const filter = { _id: new ObjectId(id) };
    const update = {
      $set: {
        name: String(req.body.name),
        duration: Number(req.body.duration),
        type: String(req.body.type),
        intensity: String(req.body.intensity),
        calories: Number(req.body.calories),
        date: String(req.body.date),
        notes: String(req.body.notes || ''),
        status: String(req.body.status),
        updatedAt: new Date()
      }
    };

    const upd = await col.updateOne(filter, update);
    if (upd.matchedCount === 0) return res.status(404).json({ error: 'Not found' });

    const updatedDoc = await col.findOne(filter);
    return res.status(200).json(updatedDoc);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE (protected)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const db = await getDb();
    const col = db.collection('workouts');

    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });

    // 204 No Content
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
