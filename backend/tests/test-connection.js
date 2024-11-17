const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://Veterinaria2696:Veterinaria2696@veterinaria.jrfdh.mongodb.net/mi_base_de_datos?retryWrites=true&w=majority";

MongoClient.connect(uri)
  .then(client => {
    console.log('¡Conexión exitosa!');
    const db = client.db('mi_base_de_datos');
    return db.listCollections().toArray();
  })
  .then(collections => {
    console.log('Colecciones disponibles:', collections.map(c => c.name));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error de conexión:', err);
    process.exit(1);
  });