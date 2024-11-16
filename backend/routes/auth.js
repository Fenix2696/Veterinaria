const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = (usersCollection) => {
  // Ruta de prueba
  router.get('/test', (req, res) => {
    res.json({ message: 'Auth route working' });
  });

  router.post('/login', async (req, res) => {
    console.log('Login request received:', req.body);
    
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        console.log('Missing credentials');
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }

      const user = await usersCollection.findOne({ email });
      console.log('User found:', user ? 'Yes' : 'No');

      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Si el usuario existe pero no tiene contraseña hasheada (usuario de prueba)
      if (!user.password.startsWith('$2a$')) {
        console.log('Creating hash for existing password');
        user.password = await bcrypt.hash(password, 10);
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { password: user.password } }
        );
      }

      const validPassword = await bcrypt.compare(password, user.password);
      console.log('Password valid:', validPassword);

      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login successful, token generated');
      res.json({
        token,
        user: {
          email: user.email,
          name: user.name || 'Usuario'
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
  });

  return router;
};