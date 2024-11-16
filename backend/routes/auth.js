const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = (usersCollection) => {
  router.post('/login', async (req, res) => {
    console.log('Login request received');
    
    try {
      const { email, password } = req.body;
      console.log('Attempting login for email:', email);

      if (!email || !password) {
        console.log('Missing credentials');
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }

      // Verificar conexión a la base de datos
      if (!usersCollection) {
        console.error('No database connection');
        return res.status(500).json({ message: 'Error de conexión a la base de datos' });
      }

      const user = await usersCollection.findOne({ email });
      console.log('User found:', user ? 'Yes' : 'No');

      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar si el usuario tiene contraseña
      if (!user.password) {
        console.error('User has no password');
        return res.status(500).json({ message: 'Error en la configuración del usuario' });
      }

      try {
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Password validation result:', validPassword);

        if (!validPassword) {
          return res.status(401).json({ message: 'Credenciales inválidas' });
        }
      } catch (bcryptError) {
        console.error('Password comparison error:', bcryptError);
        return res.status(500).json({ message: 'Error al validar credenciales' });
      }

      // Verificar JWT_SECRET
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET not configured');
        return res.status(500).json({ message: 'Error de configuración del servidor' });
      }

      const token = jwt.sign(
        { 
          userId: user._id.toString(),
          email: user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login successful, sending response');
      res.json({
        token,
        user: {
          email: user.email,
          name: user.name || 'Usuario'
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Error del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  });

  return router;
};