const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logError, logInfo } = require('../utils/logger');

function configureAuthRoutes(usersCollection) {

  // Middleware para validar datos de login
  const validateLoginData = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Formato de datos inválido'
      });
    }

    if (!email.includes('@') || email.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    next();
  };

  // Ruta de login
  router.post('/login', validateLoginData, async (req, res) => {
    try {
      const { email, password } = req.body;

      // Log de intento de login
      logInfo('Intento de login', { email });

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

      // Verificar si el usuario está activo
      if (user.status === 'inactive') {
        return res.status(401).json({
          success: false,
          message: 'Usuario inactivo'
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

        // Validaciones
        if (!email || !password) {
          return res.status(400).json({
            success: false,
            message: 'Email y contraseña son requeridos'
          });
        }

        if (password.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'La contraseña debe tener al menos 6 caracteres'
          });
        }

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
          status: 'active',
          createdAt: new Date(),
          lastLogin: null
        });

        // Log de creación exitosa
        logInfo('Usuario administrador creado', { email });

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

      // Validaciones
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren la contraseña actual y la nueva'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }

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
            updatedAt: new Date(),
            passwordChangedAt: new Date()
          }
        }
      );

      // Log de cambio exitoso
      logInfo('Contraseña actualizada', { userId: user._id, email: user.email });

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

  // Ruta para recuperar contraseña
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'El email es requerido'
        });
      }

      const user = await usersCollection.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        // Por seguridad, no revelamos si el usuario existe o no
        return res.json({
          success: true,
          message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
        });
      }

      // Generar token temporal (24h)
      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Guardar token en la base de datos
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: new Date(Date.now() + 24*60*60*1000)
          }
        }
      );

      // Aquí se enviaría el email con el token
      // Por ahora solo logueamos
      logInfo('Solicitud de recuperación de contraseña', { email });

      res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
      });

    } catch (error) {
      logError(error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Ruta de logout (opcional, ya que el token se maneja en el cliente)
  router.post('/logout', (req, res) => {
    // Aquí podrías invalidar el token si mantienes una lista negra
    // o actualizar la última sesión del usuario
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  });

  return router;
}

module.exports = configureAuthRoutes;