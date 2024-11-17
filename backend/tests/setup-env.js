const fs = require('fs');
const path = require('path');

const envContent = `MONGODB_URI=mongodb+srv://Veterinaria2696:Veterinaria2696@veterinaria.jrfdh.mongodb.net/mi_base_de_datos?retryWrites=true&w=majority
MONGODB_DB=mi_base_de_datos
JWT_SECRET=ricardo_fenix_2696
PORT=10000
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

try {
    fs.writeFileSync(envPath, envContent);
    console.log('Archivo .env creado exitosamente en:', envPath);
    
    // Verificar que el archivo se creó correctamente
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('\nContenido del archivo .env:');
    console.log(content);
    
    // Verificar que las variables se pueden leer
    require('dotenv').config();
    console.log('\nVerificando variables de entorno:');
    console.log('MONGODB_URI existe:', !!process.env.MONGODB_URI);
    console.log('MONGODB_DB:', process.env.MONGODB_DB);
    console.log('JWT_SECRET existe:', !!process.env.JWT_SECRET);
    console.log('PORT:', process.env.PORT);
    console.log('NODE_ENV:', process.env.NODE_ENV);
} catch (error) {
    console.error('Error al crear el archivo .env:', error);
}