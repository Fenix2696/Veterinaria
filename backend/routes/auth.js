const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = (usersCollection) => {
  router.post('/login', async (req, res) => {
    console.log('Received login request:', req.body);
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        console.log('Missing credentials');
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
      }

      console.log('Searching for user:', email);
      const user = await usersCollection.findOne({ email });
      
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      console.log('User found, verifying password');
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        console.log('Invalid password for:', email);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      console.log('Password valid, generating token');
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
      res.status(500).json({ 
        message: 'Error del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  return router;
};