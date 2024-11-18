const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Verificar variables de entorno requeridas
const requiredEnvVars = ['MONGODB_URI', 'MONGODB_DB', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Error: Faltan las siguientes variables de entorno:', missingEnvVars);
    process.exit(1);
}

// Configuración de variables de entorno
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

// Configuración de CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://proyecto-veterinaria-uf7y.onrender.com', 'http://localhost:3000']
        : '*',
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
let itemsCollection;
let veterinariansCollection;

// Ruta de estado/health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        dbConnected: !!db,
        collections: {
            users: !!usersCollection,
            pets: !!petsCollection,
            owners: !!ownersCollection,
            items: !!itemsCollection,
            veterinarians: !!veterinariansCollection
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
    itemsCollection = db.collection('items');
    veterinariansCollection = db.collection('veterinarians');
    
    // Configurar índices importantes
    Promise.all([
        usersCollection.createIndex({ email: 1 }, { unique: true }),
        petsCollection.createIndex({ name: 1 }),
        ownersCollection.createIndex({ email: 1 }, { unique: true }),
        itemsCollection.createIndex({ name: 1 }, { unique: true }),
        veterinariansCollection.createIndex({ email: 1 }, { unique: true }),
        veterinariansCollection.createIndex({ license: 1 }, { unique: true })
    ])
    .then(() => {
        console.log('Database indexes created successfully');
    })
    .catch(err => {
        console.error('Error creating indexes:', err);
    });
    
    // Importar y configurar rutas
    const authRoutes = require('./src/routes/auth')(usersCollection);
    const petsRoutes = require('./src/routes/pets')(petsCollection);
    const ownersRoutes = require('./src/routes/owners')(ownersCollection);
    const itemsRoutes = require('./src/routes/items')(itemsCollection);
    const veterinariansRoutes = require('./src/routes/veterinarians')(veterinariansCollection);

    // Configurar rutas con sus prefijos
    app.use('/api/auth', authRoutes);
    app.use('/api/pets', petsRoutes);
    app.use('/api/owners', ownersRoutes);
    app.use('/api/items', itemsRoutes);
    app.use('/api/veterinarians', veterinariansRoutes);

    // Ruta catch-all para servir la aplicación React en producción
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
    process.exit(1);
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    // Errores específicos de MongoDB
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Error de duplicado: el registro ya existe',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    }

    // Error general
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Manejo de promesas rechazadas no capturadas
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (process.env.NODE_ENV === 'production') {
        console.log('Cerrando el servidor debido a una excepción no capturada');
        process.exit(1);
    }
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Performing graceful shutdown...');
    if (db) {
        db.client.close().then(() => {
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// Manejo de interrupciones
process.on('SIGINT', () => {
    console.log('Received SIGINT. Performing graceful shutdown...');
    if (db) {
        db.client.close().then(() => {
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('exit', (code) => {
    console.log(`Process exit with code: ${code}`);
});

module.exports = app;