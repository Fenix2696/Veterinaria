// src/routes/veterinarians.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const Veterinarian = require('../models/veterinarian');

function configureVeterinariansRoutes(veterinariansCollection) {
  router.use(authenticateToken);

  // GET - Obtener todos los veterinarios
  router.get('/', async (req, res) => {
    try {
      const veterinarians = await veterinariansCollection.find({}).toArray();
      res.json({
        success: true,
        data: veterinarians,
        message: 'Veterinarios obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener veterinarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los veterinarios',
        error: error.message
      });
    }
  });

  // GET - Obtener un veterinario por ID
  router.get('/:id', async (req, res) => {
    try {
      const veterinarian = await veterinariansCollection.findOne({
        _id: new ObjectId(req.params.id)
      });

      if (!veterinarian) {
        return res.status(404).json({
          success: false,
          message: 'Veterinario no encontrado'
        });
      }

      res.json({
        success: true,
        data: veterinarian,
        message: 'Veterinario obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener veterinario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el veterinario',
        error: error.message
      });
    }
  });

  // POST - Crear un nuevo veterinario
  router.post('/', async (req, res) => {
    try {
      const data = {
        ...req.body,
        createdBy: req.user.userId
      };

      // Verificar si ya existe un veterinario con el mismo email o licencia
      const existingVet = await veterinariansCollection.findOne({
        $or: [
          { email: data.email.toLowerCase() },
          { license: data.license.trim() }
        ]
      });

      if (existingVet) {
        return res.status(400).json({
          success: false,
          message: existingVet.email === data.email.toLowerCase() 
            ? 'Ya existe un veterinario con este email' 
            : 'Ya existe un veterinario con este número de licencia'
        });
      }

      const veterinarian = new Veterinarian(data);
      const result = await veterinariansCollection.insertOne(veterinarian.toJSON());

      res.status(201).json({
        success: true,
        message: 'Veterinario creado exitosamente',
        data: { ...veterinarian.toJSON(), _id: result.insertedId }
      });
    } catch (error) {
      console.error('Error al crear veterinario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el veterinario',
        error: error.message
      });
    }
  });

  // PUT - Actualizar un veterinario
  router.put('/:id', async (req, res) => {
    try {
      const data = {
        ...req.body,
        updatedBy: req.user.userId
      };

      // Verificar duplicados excluyendo el veterinario actual
      const existingVet = await veterinariansCollection.findOne({
        $or: [
          { email: data.email.toLowerCase() },
          { license: data.license.trim() }
        ],
        _id: { $ne: new ObjectId(req.params.id) }
      });

      if (existingVet) {
        return res.status(400).json({
          success: false,
          message: existingVet.email === data.email.toLowerCase() 
            ? 'Ya existe otro veterinario con este email' 
            : 'Ya existe otro veterinario con este número de licencia'
        });
      }

      const veterinarian = new Veterinarian(data);
      const result = await veterinariansCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: veterinarian.toJSON() }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Veterinario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Veterinario actualizado exitosamente',
        data: { _id: req.params.id, ...veterinarian.toJSON() }
      });
    } catch (error) {
      console.error('Error al actualizar veterinario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el veterinario',
        error: error.message
      });
    }
  });

  // DELETE - Eliminar un veterinario
  router.delete('/:id', async (req, res) => {
    try {
      const result = await veterinariansCollection.deleteOne({
        _id: new ObjectId(req.params.id)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Veterinario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Veterinario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar veterinario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el veterinario',
        error: error.message
      });
    }
  });

  return router;
}

module.exports = configureVeterinariansRoutes;