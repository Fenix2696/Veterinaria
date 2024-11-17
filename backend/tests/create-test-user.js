const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const uri = "mongodb+srv://Veterinaria2696:Veterinaria2696@veterinaria.jrfdh.mongodb.net/?retryWrites=true&w=majority&appName=Veterinaria";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('mi_base_de_datos');
    const users = db.collection('users');

    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear o actualizar usuario
    const result = await users.updateOne(
      { email: 'admin@veterinaria.com' },
      {
        $set: {
          password: hashedPassword,
          name: 'Administrador',
          role: 'admin'
        }
      },
      { upsert: true }
    );

    console.log('Test user created/updated');
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createTestUser();