const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Asegurarse de que el directorio de logs existe
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'veterinaria-api' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log') 
    }),
    // Agregar transporte de consola para todos los entornos
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Funciones de utilidad para logging
const logError = (error, req = null) => {
  const logData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };

  if (req) {
    logData.method = req.method;
    logData.url = req.originalUrl;
    logData.ip = req.ip;
    logData.user = req.user ? req.user.email : 'anonymous';
  }

  logger.error(logData);
};

const logInfo = (message, data = null) => {
  logger.info({ message, data });
};

const logDebug = (message, data = null) => {
  logger.debug({ message, data });
};

module.exports = {
  logger,
  logError,
  logInfo,
  logDebug
};