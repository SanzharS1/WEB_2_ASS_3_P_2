const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../database/mongo');

const router = express.Router();

function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === String(id);
}

function validateWorkout(body) {
  const { name, duration, type } = body || {};
  if (!name || typeof name !== 'string') return 'Invalid name';
  if (duration === undefined || Number.isNaN(Number(duration))) return 'Invalid duration';
  if (!type || typeof type !== 'string') return 'Invalid type';
  return null;
}

// GET all (supports filter/sort/projection)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const col = db.collection('workouts');

    const filter = {};
    if (req.query.type) filter.type = String(req.query.type);
    if (req.query.name) filter.name = { $regex: String(req.query.name), $options: 'i' };

    const sort = {};
    if (req.query.sortBy) {
      const order = String(req.query.order || 'asc').toLowerCase() === 'desc' ? -1 : 1;
      sort[String(req.query.sortBy)] = order;
    }

    let projection;
    if (req.query.fields) {
      projection = {};
      String(req.query.fields).split(',').map(s => s.trim()).filter(Boolean)
        .forEach(f => (projection[f] = 1));
    }

    const cursor = col.find(filter);
    if (projection) cursor.project(projection);
    if (Object.keys(sort).length) cursor.sort(sort);

    const items = await cursor.toArray();
    res.status(200).json(items);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
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

    res.status(200).json(item);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const err = validateWorkout(req.body);
    if (err) return res.status(400).json({ error: err });

    const db = await getDb();
    const col = db.collection('workouts');

    const doc = {
      name: String(req.body.name),
      duration: Number(req.body.duration),
      type: String(req.body.type),
      createdAt: new Date()
    };

    const result = await col.insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const err = validateWorkout(req.body);
    if (err) return res.status(400).json({ error: err });

    const db = await getDb();
    const col = db.collection('workouts');

    const update = {
      $set: {
        name: String(req.body.name),
        duration: Number(req.body.duration),
        type: String(req.body.type),
        updatedAt: new Date()
      }
    };

const filter = { _id: new ObjectId(id) };

const upd = await col.updateOne(filter, update);

if (upd.matchedCount === 0) {
  return res.status(404).json({ error: 'Not found' });
}

const updatedDoc = await col.findOne(filter);
return res.status(200).json(updatedDoc);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const db = await getDb();
    const col = db.collection('workouts');

    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });

    res.status(200).json({ message: 'Deleted', id });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
