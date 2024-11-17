const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const authenticateToken = require('../middleware/auth');

function configureOwnersRoutes(ownersCollection) {
  // Aplicar middleware de autenticación a todas las rutas
  router.use(authenticateToken);

  // GET - Obtener todos los propietarios
  router.get('/', async (req, res) => {
    try {
      const owners = await ownersCollection.find({}).toArray();
      res.json(owners);
    } catch (error) {
      console.error('Error al obtener propietarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los propietarios',
        error: error.message
      });
    }
  });

  // GET - Obtener un propietario por ID
  router.get('/:id', async (req, res) => {
    try {
      const owner = await ownersCollection.findOne({
        _id: new ObjectId(req.params.id)
      });

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: 'Propietario no encontrado'
        });
      }

      res.json(owner);
    } catch (error) {
      console.error('Error al obtener propietario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el propietario',
        error: error.message
      });
    }
  });

  // POST - Crear un nuevo propietario
  router.post('/', async (req, res) => {
    try {
      const { name, email, phone, address } = req.body;

      // Validación básica
      if (!name || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, email y teléfono son requeridos'
        });
      }

      // Verificar si ya existe un propietario con el mismo email
      const existingOwner = await ownersCollection.findOne({ email });
      if (existingOwner) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un propietario con este email'
        });
      }

      const newOwner = {
        name,
        email,
        phone,
        address: address || '',
        createdAt: new Date(),
        createdBy: req.user.userId,
        updatedAt: new Date()
      };

      const result = await ownersCollection.insertOne(newOwner);

      res.status(201).json({
        success: true,
        message: 'Propietario creado exitosamente',
        owner: { ...newOwner, _id: result.insertedId }
      });

    } catch (error) {
      console.error('Error al crear propietario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el propietario',
        error: error.message
      });
    }
  });

  // PUT - Actualizar un propietario
  router.put('/:id', async (req, res) => {
    try {
      const { name, email, phone, address } = req.body;

      // Validación básica
      if (!name || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, email y teléfono son requeridos'
        });
      }

      // Verificar si existe otro propietario con el mismo email
      const existingOwner = await ownersCollection.findOne({
        email,
        _id: { $ne: new ObjectId(req.params.id) }
      });

      if (existingOwner) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro propietario con este email'
        });
      }

      const updateData = {
        name,
        email,
        phone,
        address: address || '',
        updatedAt: new Date(),
        updatedBy: req.user.userId
      };

      const result = await ownersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Propietario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Propietario actualizado exitosamente',
        owner: { _id: req.params.id, ...updateData }
      });

    } catch (error) {
      console.error('Error al actualizar propietario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el propietario',
        error: error.message
      });
    }
  });

  // DELETE - Eliminar un propietario
  router.delete('/:id', async (req, res) => {
    try {
      const result = await ownersCollection.deleteOne({
        _id: new ObjectId(req.params.id)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Propietario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Propietario eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar propietario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el propietario',
        error: error.message
      });
    }
  });

  return router;
}

module.exports = configureOwnersRoutes;