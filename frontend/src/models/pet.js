const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// Get all pets
router.get('/', async (req, res) => {
  try {
    const pets = await req.app.locals.db.collection('pets').find().toArray();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pets' });
  }
});

// Add a new pet
router.post('/', async (req, res) => {
  try {
    const result = await req.app.locals.db.collection('pets').insertOne(req.body);
    res.status(201).json(result.ops[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error creating pet' });
  }
});

// Get a specific pet
router.get('/:id', async (req, res) => {
  try {
    const pet = await req.app.locals.db.collection('pets').findOne({ _id: ObjectId(req.params.id) });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pet' });
  }
});

// Update a pet
router.put('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.db.collection('pets').updateOne(
      { _id: ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Pet not found' });
    res.json({ message: 'Pet updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating pet' });
  }
});

// Delete a pet
router.delete('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.db.collection('pets').deleteOne({ _id: ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Pet not found' });
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting pet' });
  }
});

module.exports = router;