const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = (usersCollection) => {
  router.post('/login', async (req, res) => {
    console.log('Login attempt:', { email: req.body.email });
    
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }

      const user = await usersCollection.findOne({ email });
      console.log('User found:', user ? 'Yes' : 'No');

      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      console.log('Password valid:', validPassword);

      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'defaultsecret',
        { expiresIn: '24h' }
      );

      console.log('Login successful for:', email);
      res.json({ 
        token, 
        user: { 
          email: user.email, 
          name: user.name 
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Error del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  return router;
};