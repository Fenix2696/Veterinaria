const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function configureAuthRoutes(usersCollection) {
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validación básica
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario
      const user = await usersCollection.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
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

      // Respuesta exitosa
      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          token,
          user: {
            email: user.email,
            role: user.role
          }
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  });

  // Verificación de token
  router.get('/verify', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token no proporcionado'
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
        data: {
          user: {
            email: user.email,
            role: user.role
          }
        }
      });

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  });

  return router;
}

module.exports = configureAuthRoutes;