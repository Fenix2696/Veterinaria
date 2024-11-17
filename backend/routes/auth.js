const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function configureAuthRoutes(usersCollection) {
  router.post('/login', async (req, res) => {
    console.log('Recibida solicitud de login');
    console.log('Body:', req.body);
    
    try {
      const { email, password } = req.body;

      // Validación
      if (!email || !password) {
        console.log('Faltan credenciales');
        return res.status(400).json({
          success: false,
          message: 'Se requiere email y contraseña'
        });
      }

      // Buscar usuario
      console.log('Buscando usuario:', email);
      const user = await usersCollection.findOne({ email });

      if (!user) {
        console.log('Usuario no encontrado');
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      console.log('Usuario encontrado, verificando contraseña');
      
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
        { userId: user._id, email: user.email, role: user.role || 'user' },
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
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      });
    }
  });

  return router;
}

module.exports = configureAuthRoutes;