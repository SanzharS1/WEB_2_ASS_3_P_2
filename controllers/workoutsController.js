const { ObjectId } = require('mongodb');
const { getDb } = require('../database/mongo');
const { validateWorkout } = require('../models/workoutModel');

function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === String(id);
}

async function getAll(req, res) {
  try {
    const db = await getDb();
    const col = db.collection('workouts');

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = String(req.query.type);

    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.session.role !== 'admin') {
      filter.userId = new ObjectId(req.session.userId);
    }

    const total = await col.countDocuments(filter);
    const items = await col
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const pages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({ items, page, limit, total, pages });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getById(req, res) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const db = await getDb();
    const col = db.collection('workouts');

    const filter = { _id: new ObjectId(id) };
    if (req.session.role !== 'admin') {
      filter.userId = new ObjectId(req.session.userId);
    }

    const item = await col.findOne(filter);
    if (!item) return res.status(404).json({ error: 'Not found' });

    return res.status(200).json(item);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function create(req, res) {
  try {
    const err = validateWorkout(req.body);
    if (err) return res.status(400).json({ error: err });

    const db = await getDb();
    const col = db.collection('workouts');

    const doc = {
      userId: new ObjectId(req.session.userId), // owner
      name: String(req.body.name),
      duration: Number(req.body.duration),
      type: String(req.body.type),
      intensity: String(req.body.intensity),
      calories: Number(req.body.calories),
      date: String(req.body.date),
      notes: String(req.body.notes || ''),
      status: String(req.body.status),
      createdAt: new Date(),
    };

    const result = await col.insertOne(doc);
    return res.status(201).json({ ...doc, _id: result.insertedId });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const err = validateWorkout(req.body);
    if (err) return res.status(400).json({ error: err });

    const db = await getDb();
    const col = db.collection('workouts');

    const filter = { _id: new ObjectId(id) };

    const updateDoc = {
      $set: {
        name: String(req.body.name),
        duration: Number(req.body.duration),
        type: String(req.body.type),
        intensity: String(req.body.intensity),
        calories: Number(req.body.calories),
        date: String(req.body.date),
        notes: String(req.body.notes || ''),
        status: String(req.body.status),
        updatedAt: new Date(),
      },
    };

    const upd = await col.updateOne(filter, updateDoc);
    if (upd.matchedCount === 0) return res.status(404).json({ error: 'Not found' });

    const updated = await col.findOne(filter);
    return res.status(200).json(updated);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const db = await getDb();
    const col = db.collection('workouts');

    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });

    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getAll, getById, create, update, remove };
