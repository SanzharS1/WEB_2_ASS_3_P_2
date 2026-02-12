const express = require('express');

const requireAuth = require('../middleware/requireAuth');
const requireOwnerOrAdmin = require('../middleware/requireOwnerOrAdmin');
const { getAll, getById, create, update, remove } = require('../controllers/workoutsController');

const router = express.Router();

// READ (login required)
router.get('/', getAll);
router.get('/:id', getById);

// WRITE (protected)
router.post('/', requireAuth, create);
router.put('/:id', requireAuth, requireOwnerOrAdmin, update);
router.delete('/:id', requireAuth, requireOwnerOrAdmin, remove);

module.exports = router;
