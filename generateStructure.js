const fs = require('fs');
const path = require('path');

function getProjectStructure(startPath = 'C:\\Veterinaria') {
    let structure = '';

    function buildStructure(currentPath, indent = '') {
        const files = fs.readdirSync(currentPath);
        
        files.forEach(file => {
            if (file === 'node_modules' || file === '.git') return; // Ignorar carpetas específicas
            
            const filePath = path.join(currentPath, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                structure += `${indent}${file}/\n`; // Mostrar carpeta
                buildStructure(filePath, indent + '  '); // Recursión para explorar subdirectorios
            } else {
                structure += `${indent}${file}\n`; // Mostrar archivo
            }
        });
    }

    buildStructure(startPath);
    return structure;
}

// Cambia la ruta si es necesario y ejecuta el script
console.log(getProjectStructure());
