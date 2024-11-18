// src/routes/items.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const Item = require('../models/item');

function configureItemsRoutes(itemsCollection) {
  router.use(authenticateToken);

  // GET - Obtener todos los items
  router.get('/', async (req, res) => {
    try {
      const items = await itemsCollection.find({}).toArray();
      res.json({
        success: true,
        data: items,
        message: 'Items obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener items:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los items',
        error: error.message
      });
    }
  });

  // GET - Obtener un item por ID
  router.get('/:id', async (req, res) => {
    try {
      const item = await itemsCollection.findOne({
        _id: new ObjectId(req.params.id)
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item no encontrado'
        });
      }

      res.json({
        success: true,
        data: item,
        message: 'Item obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener item:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el item',
        error: error.message
      });
    }
  });

  // POST - Crear un nuevo item
  router.post('/', async (req, res) => {
    try {
      const data = {
        ...req.body,
        createdBy: req.user.userId
      };

      // Verificar si ya existe un item con el mismo nombre
      const existingItem = await itemsCollection.findOne({
        name: data.name.trim()
      });

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un item con este nombre'
        });
      }

      const item = new Item(data);
      const result = await itemsCollection.insertOne(item.toJSON());

      res.status(201).json({
        success: true,
        message: 'Item creado exitosamente',
        data: { ...item.toJSON(), _id: result.insertedId }
      });
    } catch (error) {
      console.error('Error al crear item:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el item',
        error: error.message
      });
    }
  });

  // PUT - Actualizar un item
  router.put('/:id', async (req, res) => {
    try {
      const data = {
        ...req.body,
        updatedBy: req.user.userId
      };

      // Verificar si existe otro item con el mismo nombre
      const existingItem = await itemsCollection.findOne({
        name: data.name.trim(),
        _id: { $ne: new ObjectId(req.params.id) }
      });

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro item con este nombre'
        });
      }

      const item = new Item(data);
      const result = await itemsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: item.toJSON() }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Item actualizado exitosamente',
        data: { _id: req.params.id, ...item.toJSON() }
      });
    } catch (error) {
      console.error('Error al actualizar item:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el item',
        error: error.message
      });
    }
  });

  // PUT - Actualizar cantidad de stock
  router.put('/:id/stock', async (req, res) => {
    try {
      const { quantity } = req.body;
      const newQuantity = parseInt(quantity);

      if (isNaN(newQuantity)) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad debe ser un número válido'
        });
      }

      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad no puede ser negativa'
        });
      }

      const result = await itemsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { 
          $set: { 
            quantity: newQuantity,
            updatedAt: new Date(),
            updatedBy: req.user.userId
          } 
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Stock actualizado exitosamente',
        data: { quantity: newQuantity }
      });
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el stock',
        error: error.message
      });
    }
  });

  // DELETE - Eliminar un item
  router.delete('/:id', async (req, res) => {
    try {
      const result = await itemsCollection.deleteOne({
        _id: new ObjectId(req.params.id)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Item eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar item:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el item',
        error: error.message
      });
    }
  });

  return router;
}

module.exports = configureItemsRoutes;