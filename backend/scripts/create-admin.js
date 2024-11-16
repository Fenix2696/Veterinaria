const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

async function createAdmin() {
  try {
    const client = await MongoClient.connect(mongoUri);
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await usersCollection.updateOne(
      { email: 'admin@veterinaria.com' },
      {
        $set: {
          email: 'admin@veterinaria.com',
          password: adminPassword,
          name: 'Administrador',
          role: 'admin'
        }
      },
      { upsert: true }
    );

    console.log('Admin user created/updated successfully');
    client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin();