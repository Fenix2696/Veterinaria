const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// Get all owners
router.get('/', async (req, res) => {
  try {
    const owners = await req.app.locals.db.collection('owners').find().toArray();
    res.json(owners);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching owners' });
  }
});

// Add a new owner
router.post('/', async (req, res) => {
  try {
    const result = await req.app.locals.db.collection('owners').insertOne(req.body);
    res.status(201).json(result.ops[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating owner' });
  }
});

// Get a specific owner
router.get('/:id', async (req, res) => {
  try {
    const owner = await req.app.locals.db.collection('owners').findOne({ _id: ObjectId(req.params.id) });
    if (!owner) return res.status(404).json({ error: 'Owner not found' });
    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching owner' });
  }
});

// Update an owner
router.put('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.db.collection('owners').updateOne(
      { _id: ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Owner not found' });
    res.json({ message: 'Owner updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating owner' });
  }
});

// Delete an owner
router.delete('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.db.collection('owners').deleteOne({ _id: ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Owner not found' });
    res.json({ message: 'Owner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting owner' });
  }
});

module.exports = router;