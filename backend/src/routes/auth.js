const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateEmail } = require('../utils/validations');
const { logError, logInfo } = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responses');

function configureAuthRoutes(usersCollection) {
  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validación básica
      if (!email || !password) {
        return errorResponse(res, 'Email y contraseña son requeridos', 400);
      }

      if (!validateEmail(email)) {
        return errorResponse(res, 'Email inválido', 400);
      }

      // Buscar usuario
      const user = await usersCollection.findOne({ email: email.toLowerCase() });
      if (!user) {
        logInfo('Intento de login fallido - Usuario no encontrado', { email });
        return errorResponse(res, 'Credenciales inválidas', 401);
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logInfo('Intento de login fallido - Contraseña incorrecta', { email });
        return errorResponse(res, 'Credenciales inválidas', 401);
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

      logInfo('Login exitoso', { email });
      
      return successResponse(res, {
        token,
        user: {
          email: user.email,
          role: user.role
        }
      }, 'Login exitoso');

    } catch (error) {
      logError(error);
      return errorResponse(res, 'Error en el servidor', 500, error);
    }
  });

  // Verificar token
  router.get('/verify', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return errorResponse(res, 'Token no proporcionado', 401);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await usersCollection.findOne(
        { _id: decoded.userId },
        { projection: { password: 0 } }
      );

      if (!user) {
        return errorResponse(res, 'Usuario no encontrado', 401);
      }

      return successResponse(res, {
        user: {
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Token inválido', 401);
      }
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expirado', 401);
      }
      
      logError(error);
      return errorResponse(res, 'Error en la verificación', 500, error);
    }
  });

  return router;
}

module.exports = configureAuthRoutes;