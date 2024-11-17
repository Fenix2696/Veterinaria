const jwt = require('jsonwebtoken');
const { logError } = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
    try {
        // Obtener el token del header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de acceso'
            });
        }

        // Verificar formato del token (Bearer token)
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        try {
            // Verificar y decodificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Añadir información del usuario decodificada a la request
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };

            // Log de acceso exitoso (opcional)
            console.log(`Usuario autenticado: ${decoded.email}`);
            
            next();
        } catch (tokenError) {
            // Manejar diferentes tipos de errores de token
            if (tokenError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado'
                });
            }
            
            if (tokenError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido'
                });
            }

            throw tokenError; // Otros errores inesperados
        }
    } catch (error) {
        // Log del error para debugging
        logError(error);
        console.error('Error en autenticación:', error);

        // Respuesta genérica para errores no esperados
        return res.status(500).json({
            success: false,
            message: 'Error en la autenticación',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware opcional para verificar roles
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado: rol no especificado'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado: rol no autorizado'
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRole
};