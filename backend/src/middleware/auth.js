const jwt = require('jsonwebtoken');
const { logError } = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log('No se encontró header de autorización');
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de acceso'
            });
        }

        if (!authHeader.startsWith('Bearer ')) {
            console.log('Formato de token incorrecto');
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            console.log('Token vacío');
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role || 'user' // Asegurar que siempre haya un rol
            };

            console.log(`Usuario autenticado: ${decoded.email} (${decoded.role})`);
            
            next();
        } catch (tokenError) {
            if (tokenError.name === 'TokenExpiredError') {
                console.log('Token expirado');
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado'
                });
            }
            
            if (tokenError.name === 'JsonWebTokenError') {
                console.log('Token inválido');
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido'
                });
            }

            throw tokenError;
        }
    } catch (error) {
        logError(error);
        console.error('Error en autenticación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en la autenticación',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware mejorado para verificar roles
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                console.log('No se encontró información del usuario');
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado: usuario no autenticado'
                });
            }

            const userRole = req.user.role || 'user';

            if (!allowedRoles.includes(userRole)) {
                console.log(`Acceso denegado para el rol: ${userRole}`);
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado: rol no autorizado'
                });
            }

            console.log(`Acceso autorizado para rol: ${userRole}`);
            next();
        } catch (error) {
            logError(error);
            console.error('Error en autorización:', error);
            return res.status(500).json({
                success: false,
                message: 'Error en la autorización',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};

// Nuevo middleware para verificar permisos específicos
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role || 'user';
            
            // Define los permisos por rol
            const rolePermissions = {
                admin: ['read', 'write', 'delete', 'manage'],
                user: ['read']
            };

            const userPermissions = rolePermissions[userRole] || [];

            if (!userPermissions.includes(requiredPermission)) {
                console.log(`Permiso denegado: ${requiredPermission} para rol ${userRole}`);
                return res.status(403).json({
                    success: false,
                    message: 'Permiso denegado'
                });
            }

            next();
        } catch (error) {
            logError(error);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos'
            });
        }
    };
};

module.exports = {
    authenticateToken,
    authorizeRole,
    checkPermission
};