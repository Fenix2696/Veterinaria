require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testDatabase() {
  try {
    // Verificar variables de entorno
    console.log('Verificando configuración...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_DB:', process.env.MONGODB_DB);
    console.log('MONGODB_URI está definida:', !!process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en el archivo .env');
    }

    // Crear cliente MongoDB
    const client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Intentando conectar a MongoDB...');
    await client.connect();
    console.log('Conectado exitosamente a MongoDB');

    const db = client.db(process.env.MONGODB_DB);
    console.log('Base de datos seleccionada:', process.env.MONGODB_DB);

    // Probar la colección de usuarios
    const usersCollection = db.collection('users');
    const usersCount = await usersCollection.countDocuments();
    console.log('Número de usuarios en la base de datos:', usersCount);

    await client.close();
    console.log('Conexión cerrada');

  } catch (error) {
    console.error('Error detallado:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  }
}

testDatabase();