# Limpiar e instalar frontend
Set-Location -Path frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install
npm run build

# Copiar build al backend
Remove-Item -Recurse -Force ../backend/dist -ErrorAction SilentlyContinue
Copy-Item -Recurse build ../backend/dist

# Limpiar e instalar backend
Set-Location -Path ../backend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install

# Volver al directorio raíz
Set-Location -Path ..