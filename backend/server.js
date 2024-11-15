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

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

let db;
let usersCollection;
let petsCollection;
let ownersCollection;

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token inválido' });
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
    
    const authRoutes = require('./routes/auth')(usersCollection);
    const petsRoutes = require('./routes/pets')(petsCollection);
    const ownersRoutes = require('./routes/owners')(ownersCollection);

    // Rutas de API
    app.use('/api/auth', authRoutes);
    app.use('/api/pets', authenticateToken, petsRoutes);
    app.use('/api/owners', authenticateToken, ownersRoutes);

    // Ruta para verificar el estado del servidor
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Server is running' });
    });

    // Servir archivos estáticos y manejar rutas del cliente
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
    process.exit(1);
  });

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
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