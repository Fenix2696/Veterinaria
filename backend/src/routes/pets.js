const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Configuración de las rutas para el manejo de mascotas
function configurePetsRoutes(petsCollection) {
  // Middleware de autenticación para todas las rutas
  router.use(authenticateToken);

  /**
   * GET - Obtener todas las mascotas
   */
  router.get('/', async (req, res) => {
    try {
      const pets = await petsCollection.find({}).toArray();
      res.json({
        success: true,
        data: pets,
        message: 'Mascotas obtenidas exitosamente',
      });
    } catch (error) {
      console.error('Error al obtener mascotas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las mascotas',
        error: error.message,
      });
    }
  });

  /**
   * GET - Obtener una mascota por ID
   */
  router.get('/:id', async (req, res) => {
    try {
      const pet = await petsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: 'Mascota no encontrada',
        });
      }

      res.json({
        success: true,
        data: pet,
        message: 'Mascota obtenida exitosamente',
      });
    } catch (error) {
      console.error('Error al obtener mascota:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la mascota',
        error: error.message,
      });
    }
  });

  /**
   * POST - Crear una nueva mascota
   */
  router.post('/', async (req, res) => {
    try {
      const { name, species, age, owner } = req.body;

      // Validación básica
      if (!name || !species || !age) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, especie y edad son requeridos',
        });
      }

      const newPet = {
        name,
        species,
        age: parseInt(age, 10),
        owner: owner || null,
        createdAt: new Date(),
        createdBy: req.user.userId,
        updatedAt: new Date(),
      };

      const result = await petsCollection.insertOne(newPet);

      res.status(201).json({
        success: true,
        message: 'Mascota creada exitosamente',
        data: { ...newPet, _id: result.insertedId },
      });
    } catch (error) {
      console.error('Error al crear mascota:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la mascota',
        error: error.message,
      });
    }
  });

  /**
   * PUT - Actualizar una mascota
   */
  router.put('/:id', async (req, res) => {
    try {
      const { name, species, age, owner } = req.body;

      // Validación básica
      if (!name || !species || !age) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, especie y edad son requeridos',
        });
      }

      const updateData = {
        name,
        species,
        age: parseInt(age, 10),
        owner: owner || null,
        updatedAt: new Date(),
        updatedBy: req.user.userId,
      };

      const result = await petsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mascota no encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Mascota actualizada exitosamente',
        data: { _id: req.params.id, ...updateData },
      });
    } catch (error) {
      console.error('Error al actualizar mascota:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la mascota',
        error: error.message,
      });
    }
  });

  /**
   * DELETE - Eliminar una mascota
   */
  router.delete('/:id', async (req, res) => {
    try {
      const result = await petsCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mascota no encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Mascota eliminada exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la mascota',
        error: error.message,
      });
    }
  });

  return router;
}

module.exports = configurePetsRoutes;
