const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

module.exports = (ownersCollection) => {
  // Obtener todos los propietarios
  router.get('/', async (req, res) => {
    try {
      const owners = await ownersCollection.find().toArray();
      res.json(owners);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Añadir un nuevo propietario
  router.post('/', async (req, res) => {
    try {
      const newOwner = req.body;
      const result = await ownersCollection.insertOne(newOwner);
      res.status(201).json(result.ops[0]);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Obtener un propietario específico
  router.get('/:id', async (req, res) => {
    try {
      const owner = await ownersCollection.findOne({ _id: ObjectId(req.params.id) });
      if (!owner) return res.status(404).json({ message: 'Propietario no encontrado' });
      res.json(owner);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Actualizar un propietario
  router.put('/:id', async (req, res) => {
    try {
      const updatedOwner = await ownersCollection.findOneAndUpdate(
        { _id: ObjectId(req.params.id) },
        { $set: req.body },
        { returnOriginal: false }
      );
      if (!updatedOwner.value) return res.status(404).json({ message: 'Propietario no encontrado' });
      res.json(updatedOwner.value);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Eliminar un propietario
  router.delete('/:id', async (req, res) => {
    try {
      const result = await ownersCollection.deleteOne({ _id: ObjectId(req.params.id) });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'Propietario no encontrado' });
      res.json({ message: 'Propietario eliminado' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};