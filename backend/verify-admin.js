const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function verifyAdmin() {
    // Verificar que tenemos las variables de entorno necesarias
    console.log('Verificando variables de entorno...');
    if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI no está definida en .env');
        return;
    }

    console.log('MONGODB_URI encontrada');
    console.log('MONGODB_DB:', process.env.MONGODB_DB);

    const client = new MongoClient(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });
    
    try {
        console.log('Intentando conectar a MongoDB...');
        await client.connect();
        console.log('Conexión exitosa a MongoDB');
        
        const db = client.db(process.env.MONGODB_DB);
        const usersCollection = db.collection('users');
        
        // Buscar usuario admin
        console.log('Buscando usuario admin...');
        const adminUser = await usersCollection.findOne({ email: 'admin@veterinaria.com' });
        
        if (!adminUser) {
            console.log('Usuario admin no encontrado. Creando nuevo usuario admin...');
            
            // Crear hash de la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            // Crear usuario admin
            const result = await usersCollection.insertOne({
                email: 'admin@veterinaria.com',
                password: hashedPassword,
                role: 'admin',
                createdAt: new Date()
            });
            
            console.log('Usuario admin creado exitosamente', result.insertedId);
        } else {
            console.log('Usuario admin encontrado:', {
                email: adminUser.email,
                role: adminUser.role,
                hasPassword: !!adminUser.password,
                createdAt: adminUser.createdAt
            });
            
            // Actualizar contraseña del admin
            console.log('Actualizando contraseña del admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            const updateResult = await usersCollection.updateOne(
                { email: 'admin@veterinaria.com' },
                { 
                    $set: { 
                        password: hashedPassword,
                        updatedAt: new Date()
                    } 
                }
            );
            
            console.log('Contraseña actualizada:', updateResult.modifiedCount > 0);
        }
        
    } catch (error) {
        console.error('Error detallado:', {
            message: error.message,
            stack: error.stack
        });
    } finally {
        await client.close();
        console.log('Conexión cerrada');
    }
}

// Ejecutar y manejar errores
verifyAdmin()
    .catch(error => {
        console.error('Error en la ejecución:', error);
        process.exit(1);
    });