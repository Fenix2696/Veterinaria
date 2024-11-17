const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logError, logInfo } = require('../utils/logger');

function configureAuthRoutes(usersCollection) {
  // Ruta de login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Log de intento de login
      logInfo('Intento de login', { email });

      // Validación básica
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario por email
      const user = await usersCollection.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        logInfo('Intento de login fallido - Usuario no encontrado', { email });
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        logInfo('Intento de login fallido - Contraseña incorrecta', { email });
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role || 'user'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Log de login exitoso
      logInfo('Login exitoso', { email, userId: user._id });

      // Respuesta exitosa
      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          token,
          user: {
            email: user.email,
            role: user.role || 'user'
          }
        }
      });

    } catch (error) {
      logError(error);
      console.error('Error en login:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Ruta de verificación de token
  router.get('/verify', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token no proporcionado'
        });
      }

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuario para asegurar que aún existe
      const user = await usersCollection.findOne(
        { _id: decoded.userId },
        { projection: { password: 0 } } // Excluir la contraseña
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Respuesta exitosa
      return res.json({
        success: true,
        data: {
          user: {
            email: user.email,
            role: user.role || 'user'
          }
        }
      });

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }

      logError(error);
      return res.status(500).json({
        success: false,
        message: 'Error en la verificación del token'
      });
    }
  });

  // Ruta para crear usuario de prueba/admin (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    router.post('/create-admin', async (req, res) => {
      try {
        const { email, password } = req.body;

        // Verificar si ya existe
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

        // Crear usuario admin
        const result = await usersCollection.insertOne({
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'admin',
          createdAt: new Date()
        });

        // Respuesta exitosa
        res.status(201).json({
          success: true,
          message: 'Usuario administrador creado exitosamente'
        });

      } catch (error) {
        logError(error);
        res.status(500).json({
          success: false,
          message: 'Error al crear usuario administrador',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    });
  }

  // Ruta para cambiar contraseña (requiere autenticación)
  router.post('/change-password', async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado'
        });
      }

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await usersCollection.findOne({ _id: decoded.userId });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Hash de la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Actualizar contraseña
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date()
          }
        }
      );

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      logError(error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar la contraseña',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Ruta de logout (opcional, ya que el token se maneja en el cliente)
  router.post('/logout', (req, res) => {
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  });

  return router;
}

module.exports = configureAuthRoutes;