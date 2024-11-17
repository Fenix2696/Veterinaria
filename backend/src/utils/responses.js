const successResponse = (res, data, message = 'Operación exitosa', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  };
  
  const errorResponse = (res, message = 'Error interno del servidor', statusCode = 500, error = null) => {
    const response = {
      success: false,
      message
    };
  
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = error.toString();
      response.stack = error.stack;
    }
  
    return res.status(statusCode).json(response);
  };
  
  const validationError = (res, errors) => {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  };
  
  module.exports = {
    successResponse,
    errorResponse,
    validationError
  };