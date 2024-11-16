const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function configureAuthRoutes(usersCollection) {
  // Login route
  router.post('/login', async (req, res) => {
    try {
      console.log('Intento de login recibido:', { email: req.body.email });
      
      const { email, password } = req.body;

      // Validación básica
      if (!email || !password) {
        console.log('Faltan credenciales');
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario
      const user = await usersCollection.findOne({ email });
      console.log('Usuario encontrado:', user ? 'Sí' : 'No');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Contraseña válida:', isValidPassword);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generar token
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          role: user.role || 'user'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Token generado exitosamente');
      
      res.json({
        success: true,
        token,
        user: {
          email: user.email,
          role: user.role || 'user'
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Verificar token route
  router.get('/verify', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await usersCollection.findOne({ _id: decoded.userId });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        user: {
          email: user.email,
          role: user.role || 'user'
        }
      });

    } catch (error) {
      console.error('Error en verificación:', error);
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  });

  // Registro route (opcional, para crear usuarios de prueba)
  router.post('/register', async (req, res) => {
    try {
      const { email, password, role } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya existe'
        });
      }

      // Hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear nuevo usuario
      const user = await usersCollection.insertOne({
        email,
        password: hashedPassword,
        role: role || 'user',
        createdAt: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente'
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear usuario'
      });
    }
  });

  return router;
}

module.exports = configureAuthRoutes;