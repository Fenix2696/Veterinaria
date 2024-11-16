const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = (usersCollection) => {
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt for:', email);

      const user = await usersCollection.findOne({ email });
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        console.log('Invalid password for:', email);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login successful for:', email);
      res.json({ 
        token,
        user: { email: user.email, name: user.name }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error del servidor' });
    }
  });

  // Ruta para verificar token
  router.get('/verify', async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ valid: false });

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      res.json({ valid: true, user: verified });
    } catch (error) {
      res.status(401).json({ valid: false });
    }
  });

  return router;
});