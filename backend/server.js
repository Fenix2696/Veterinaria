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

// Middleware de logging para desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Configuración de CORS mejorada
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? [
    'https://proyecto-veterinaria-uf7y.onrender.com',
    'http://localhost:3000'
  ] : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware para parsear JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Variables globales para las colecciones de MongoDB
let db;
let usersCollection;
let petsCollection;
let ownersCollection;

// Middleware de autenticación global
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Ruta de estado/health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    dbConnected: !!db,
    collections: {
      users: !!usersCollection,
      pets: !!petsCollection,
      owners: !!ownersCollection
    }
  });
});

// Conexión a MongoDB
MongoClient.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
.then(client => {
  console.log('Connected to MongoDB');
  db = client.db(dbName);
  
  // Inicializar colecciones
  usersCollection = db.collection('users');
  petsCollection = db.collection('pets');
  ownersCollection = db.collection('owners');
  
  // Configurar índices importantes
  Promise.all([
    usersCollection.createIndex({ email: 1 }, { unique: true }),
    petsCollection.createIndex({ name: 1 }),
    ownersCollection.createIndex({ email: 1 }, { unique: true })
  ]).then(() => {
    console.log('Database indexes created successfully');
  }).catch(err => {
    console.error('Error creating indexes:', err);
  });
  
  // Configurar rutas
  const authRoutes = require('./src/routes/auth')(usersCollection);
  const petsRoutes = require('./src/routes/pets')(petsCollection);
  const ownersRoutes = require('./src/routes/owners')(ownersCollection);

  // Aplicar rutas con sus prefijos
  app.use('/api/auth', authRoutes);
  app.use('/api/pets', authenticateToken, petsRoutes);
  app.use('/api/owners', authenticateToken, ownersRoutes);

  // Ruta para servir la aplicación React en producción
  if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Iniciar servidor
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB Connected to:', dbName);
  });
})
.catch(error => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1); // Salir si no podemos conectar a la base de datos
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Errores de MongoDB
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Error de duplicado: el registro ya existe',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
  
  // Error general
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Manejo de promesas rechazadas no capturadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // En producción podrías querer hacer algo más que solo logear
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // En producción deberías cerrar el servidor gracefully
  if (process.env.NODE_ENV === 'production') {
    console.log('Cerrando el servidor debido a una excepción no capturada');
    process.exit(1);
  }
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Performing graceful shutdown...');
  // Cerrar conexiones de DB y servidor
  if (db) {
    db.client.close().then(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = app; // Para testing