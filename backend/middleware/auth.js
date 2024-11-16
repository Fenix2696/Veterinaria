const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Habilitar CORS para las solicitudes de autenticación
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  try {
    // Obtener el token del header de autorización
    const authHeader = req.header('Authorization');
    console.log('Auth Header:', authHeader); // Para debug

    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token:', token); // Para debug

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); // Para debug
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(403).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in auth middleware' });
  }
};

module.exports = authMiddleware;