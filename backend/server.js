const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

// Configuración de CORS mejorada
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('dist'));

// Variables globales
let db;
let usersCollection;
let petsCollection;
let ownersCollection;

// Ruta de prueba/estado
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dbConnected: !!db,
    collections: {
      users: !!usersCollection,
      pets: !!petsCollection,
      owners: !!ownersCollection
    }
  });
});

// Conexión a MongoDB
MongoClient.connect(mongoUri)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    
    usersCollection = db.collection('users');
    petsCollection = db.collection('pets');
    ownersCollection = db.collection('owners');
    
    // Configurar rutas
    const authRoutes = require('./routes/auth')(usersCollection);
    const petsRoutes = require('./routes/pets')(petsCollection);
    const ownersRoutes = require('./routes/owners')(ownersCollection);

    app.use('/api/auth', authRoutes);
    app.use('/api/pets', petsRoutes);
    app.use('/api/owners', ownersRoutes);

    // Ruta catch-all para el frontend
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });

    // Iniciar servidor
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log('Environment:', process.env.NODE_ENV);
    });
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});