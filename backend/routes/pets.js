const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

module.exports = (petsCollection) => {
  // Obtener todas las mascotas
  router.get('/', async (req, res) => {
    try {
      const pets = await petsCollection.find().toArray();
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Añadir una nueva mascota
  router.post('/', async (req, res) => {
    try {
      const newPet = req.body;
      const result = await petsCollection.insertOne(newPet);
      res.status(201).json(result.ops[0]);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Obtener una mascota específica
  router.get('/:id', async (req, res) => {
    try {
      const pet = await petsCollection.findOne({ _id: ObjectId(req.params.id) });
      if (!pet) return res.status(404).json({ message: 'Mascota no encontrada' });
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Actualizar una mascota
  router.put('/:id', async (req, res) => {
    try {
      const updatedPet = await petsCollection.findOneAndUpdate(
        { _id: ObjectId(req.params.id) },
        { $set: req.body },
        { returnOriginal: false }
      );
      res.json(updatedPet.value);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Eliminar una mascota
  router.delete('/:id', async (req, res) => {
    try {
      await petsCollection.deleteOne({ _id: ObjectId(req.params.id) });
      res.json({ message: 'Mascota eliminada' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};