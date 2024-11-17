import React, { useState } from 'react';

const API_URL = 'https://proyecto-veterinaria-uf7y.onrender.com/api';

const LoginForm = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Iniciando login con:', {
      email: credentials.email,
      passwordProvided: !!credentials.password
    });

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password
        })
      });

      console.log('Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        headers: {
          contentType: response.headers.get('content-type')
        }
      });

      const data = await response.json();
      console.log('Datos de respuesta:', {
        success: data.success,
        hasMessage: !!data.message,
        hasData: !!data.data,
        hasToken: !!data.data?.token
      });

      if (!response.ok) {
        throw new Error(data.message || `Error del servidor: ${response.status}`);
      }

      if (!data.success || !data.data?.token) {
        console.error('Respuesta inesperada:', data);
        throw new Error('Error en la autenticación: Token no recibido');
      }

      localStorage.setItem('token', data.data.token);
      console.log('Login exitoso - Token almacenado');
      onLoginSuccess();

    } catch (error) {
      console.error('Error durante el login:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      setError(
        error.message === 'Failed to fetch'
          ? 'Error de conexión al servidor. Por favor, verifica tu conexión a internet.'
          : error.message || 'Error durante el inicio de sesión'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Veterinaria</h1>
          <p className="text-gray-500 mt-2">Inicia sesión en tu cuenta</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={e => setCredentials({...credentials, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={credentials.password}
              onChange={e => setCredentials({...credentials, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Cargando...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <div className="text-sm text-center mt-4 text-gray-600">
            <p>Credenciales de prueba:</p>
            <p>Email: admin@veterinaria.com</p>
            <p>Contraseña: admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;