const fs = require('fs');
const path = require('path');

function getProjectStructure(startPath = 'C:\\Veterinaria') {
    let structure = '';
    
    function buildStructure(currentPath, indent = '') {
        const files = fs.readdirSync(currentPath);
        
        files.forEach(file => {
            if (file === 'node_modules' || file === '.git') return;
            
            const filePath = path.join(currentPath, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                structure += `${indent}${file}/\n`;
                buildStructure(filePath, indent + '  ');
            } else {
                structure += `${indent}${file}\n`;
            }
        });
    }

    buildStructure(startPath);
    return structure;
}

console.log(getProjectStructure());