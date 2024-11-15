import React, { useState } from 'react';
import { login } from '../services/auth';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Iniciar Sesión
        </h2>
        
        {error && (
          <div className="p-3 bg-red-50 text-red-500 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({
                ...credentials,
                email: e.target.value
              })}
              placeholder="Email"
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({
                ...credentials,
                password: e.target.value
              })}
              placeholder="Contraseña"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;