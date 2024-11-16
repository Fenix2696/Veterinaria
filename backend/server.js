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

// Configuración CORS mejorada
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.static('dist'));

let db;
let usersCollection;
let petsCollection;
let ownersCollection;

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  // Permitir preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Token recibido:', token); // Debug

  if (!token) {
    console.log('No token provided'); // Debug
    return res.status(401).json({ message: 'Acceso denegado - Token no proporcionado' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verificado:', verified); // Debug
    req.user = verified;
    next();
  } catch (err) {
    console.log('Error de verificación:', err); // Debug
    res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

MongoClient.connect(mongoUri)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    
    usersCollection = db.collection('users');
    petsCollection = db.collection('pets');
    ownersCollection = db.collection('owners');
    
    // Crear índices
    usersCollection.createIndex({ email: 1 }, { unique: true });
    petsCollection.createIndex({ name: 1 });
    ownersCollection.createIndex({ email: 1 }, { unique: true });
    
    // Configurar rutas
    const authRoutes = require('./routes/auth')(usersCollection);
    const petsRoutes = require('./routes/pets')(petsCollection);
    const ownersRoutes = require('./routes/owners')(ownersCollection);

    // Rutas de API con manejo de errores mejorado
    app.use('/api/auth', authRoutes);
    
    app.use('/api/pets', authenticateToken, (req, res, next) => {
      console.log('Petición a /api/pets'); // Debug
      next();
    }, petsRoutes);
    
    app.use('/api/owners', authenticateToken, (req, res, next) => {
      console.log('Petición a /api/owners'); // Debug
      next();
    }, ownersRoutes);

    // Ruta de healthcheck
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        message: 'Server is running',
        environment: process.env.NODE_ENV
      });
    });

    // Manejo de errores para rutas no encontradas
    app.use('/api/*', (req, res) => {
      res.status(404).json({ message: 'API endpoint not found' });
    });

    // Servir frontend
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });

    // Iniciar servidor
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});