const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Conectado a MongoDB');

    const db = client.db(process.env.MONGODB_DB);
    const usersCollection = db.collection('users');

    // Verificar si el admin ya existe
    const existingAdmin = await usersCollection.findOne({ email: 'admin@veterinaria.com' });
    
    if (existingAdmin) {
      console.log('El usuario administrador ya existe');
      return;
    }

    // Crear hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Crear usuario administrador
    const result = await usersCollection.insertOne({
      email: 'admin@veterinaria.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });

    console.log('Usuario administrador creado exitosamente');

  } catch (error) {
    console.error('Error al crear admin:', error);
  } finally {
    await client.close();
  }
}

createAdmin();