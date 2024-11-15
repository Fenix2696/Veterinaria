const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (usersCollection) => {
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('Intentando login con:', email); // Debug

      const user = await usersCollection.findOne({ email });
      
      if (!user) {
        console.log('Usuario no encontrado'); // Debug
        return res.status(401).json({ message: 'Email o contraseña incorrectos' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        console.log('Contraseña inválida'); // Debug
        return res.status(401).json({ message: 'Email o contraseña incorrectos' });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login exitoso'); // Debug
      res.json({ 
        token,
        user: { email: user.email, name: user.name }
      });
      
    } catch (error) {
      console.error('Error en login:', error); // Debug
      res.status(500).json({ message: 'Error del servidor' });
    }
  });

  return router;
};