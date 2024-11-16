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

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('dist'));

let db;
let usersCollection;
let petsCollection;
let ownersCollection;

MongoClient.connect(mongoUri)
  .then(async client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    console.log('Database selected:', dbName);
    
    // Inicializar colecciones
    usersCollection = db.collection('users');
    petsCollection = db.collection('pets');
    ownersCollection = db.collection('owners');
    console.log('Collections initialized');
    
    // Crear índices de manera segura
    try {
      await Promise.all([
        usersCollection.createIndex({ email: 1 }, { unique: true }),
        petsCollection.createIndex({ name: 1 }),
        ownersCollection.createIndex({ email: 1 }, { unique: true })
      ]);
      console.log('Indices created successfully');
    } catch (error) {
      console.log('Index creation error (non-fatal):', error);
    }
    
    // Configurar rutas
    const authRoutes = require('./routes/auth')(usersCollection);
    const petsRoutes = require('./routes/pets')(petsCollection);
    const ownersRoutes = require('./routes/owners')(ownersCollection);

    app.use('/api/auth', authRoutes);
    app.use('/api/pets', petsRoutes);
    app.use('/api/owners', ownersRoutes);

    // Ruta de healthcheck
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Server is running' });
    });

    // Servir frontend
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });

    // Iniciar servidor
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
    // No salir del proceso en producción
    if (process.env.NODE_ENV === 'production') {
      console.log('Continuing despite MongoDB connection error');
    } else {
      process.exit(1);
    }
  });

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});