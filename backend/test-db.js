const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Veterinaria2696:Veterinaria2696@veterinaria.jrfdh.mongodb.net/?retryWrites=true&w=majority&appName=Veterinaria";

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db('mi_base_de_datos');
    
    // Probar usuarios
    const users = await db.collection('users').find().toArray();
    console.log('Usuarios encontrados:', users.length);
    
    // Probar mascotas
    const pets = await db.collection('pets').find().toArray();
    console.log('Mascotas encontradas:', pets.length);
    
    // Probar propietarios
    const owners = await db.collection('owners').find().toArray();
    console.log('Propietarios encontrados:', owners.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testConnection();