#!/bin/bash

# Limpiar e instalar frontend
cd frontend
rm -rf node_modules
rm -rf build
rm -f package-lock.json
npm cache clean --force
npm install
CI=false npm run build

# Copiar build al backend
rm -rf ../backend/dist
cp -r build ../backend/dist

# Limpiar e instalar backend
cd ../backend
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force
npm install