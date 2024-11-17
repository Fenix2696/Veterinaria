require('dotenv').config();
const { MongoClient } = require('mongodb');

console.log('Iniciando verificación de conexión...');

// Verificar que tenemos las variables necesarias
if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI no está definida');
    process.exit(1);
}

if (!process.env.MONGODB_DB) {
    console.error('Error: MONGODB_DB no está definida');
    process.exit(1);
}

// Mostrar información de configuración (ocultando la contraseña)
const uriForDisplay = process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':***@');
console.log('\nConfiguración actual:');
console.log('URI:', uriForDisplay);
console.log('Database:', process.env.MONGODB_DB);
console.log('Environment:', process.env.NODE_ENV);

// Intentar conexión
console.log('\nIntentando conexión...');

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000
});

client.connect()
    .then(async () => {
        console.log('Conexión exitosa a MongoDB');
        
        const db = client.db(process.env.MONGODB_DB);
        const collections = await db.listCollections().toArray();
        
        console.log('\nColecciones encontradas:');
        collections.forEach(coll => console.log(`- ${coll.name}`));
        
        return client.close();
    })
    .then(() => {
        console.log('\nConexión cerrada correctamente');
        process.exit(0);
    })
    .catch(err => {
        console.error('\nError de conexión:', err);
        process.exit(1);
    });