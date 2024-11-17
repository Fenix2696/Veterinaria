import React, { useState, useEffect } from 'react';
import './App.css';

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

    // Debug: Mostrar información de la solicitud
    console.log('Enviando solicitud al servidor:', {
      url: `${API_URL}/auth/login`,
      method: 'POST',
      credentials: {
        email: credentials.email,
        passwordLength: credentials.password?.length || 0
      }
    });

    try {
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password
        })
      };

      // Debug: Mostrar opciones de fetch
      console.log('Opciones de fetch:', {
        ...fetchOptions,
        body: '***HIDDEN***'
      });

      const response = await fetch(`${API_URL}/auth/login`, fetchOptions);
      
      // Debug: Mostrar información de la respuesta
      console.log('Respuesta inicial del servidor:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Respuesta JSON:', data);
      } else {
        const textResponse = await response.text();
        console.log('Respuesta texto:', textResponse);
        throw new Error(`Respuesta no JSON: ${textResponse}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Error del servidor: ${response.status}`);
      }

      if (!data.token) {
        throw new Error('No se recibió token de autenticación');
      }

      // Login exitoso
      localStorage.setItem('token', data.token);
      console.log('Login exitoso, token almacenado');
      onLoginSuccess();

    } catch (error) {
      console.error('Error detallado:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      setError(
        error.message === 'Failed to fetch' 
          ? 'Error de conexión con el servidor. Por favor, verifica tu conexión a internet.'
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
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('No se encontró token');
        onLogout();
        return;
      }

      try {
        let endpoint = '';
        let setData;

        switch (currentPage) {
          case 'pets':
            endpoint = '/pets';
            setData = setPets;
            break;
          case 'owners':
            endpoint = '/owners';
            setData = setOwners;
            break;
          default:
            return;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Sesión expirada');
          }
          throw new Error(`Error al cargar ${currentPage}`);
        }

        const data = await response.json();
        setData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        if (err.message === 'Sesión expirada') {
          onLogout();
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentPage !== 'dashboard') {
      fetchData();
    }
  }, [currentPage, onLogout]);

  const renderPetList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Mascotas</h2>
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edad
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pets.map((pet) => (
                <tr key={pet._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{pet.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{pet.species}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{pet.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderOwnerList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Propietarios</h2>
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {owners.map((owner) => (
                <tr key={owner._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{owner.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{owner.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{owner.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch(currentPage) {
      case 'pets':
        return renderPetList();
      case 'owners':
        return renderOwnerList();
      default:
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800">Bienvenido al Sistema Veterinario</h2>
            <p className="mt-2 text-gray-600">Selecciona una opción del menú para comenzar.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-800 p-4">
        <h1 className="text-white text-xl font-bold mb-8">Veterinaria</h1>
        <nav className="space-y-2">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full text-left p-2 rounded ${
              currentPage === 'dashboard' ? 'bg-gray-600 text-white' : 'text-white hover:bg-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('pets')}
            className={`w-full text-left p-2 rounded ${
              currentPage === 'pets' ? 'bg-gray-600 text-white' : 'text-white hover:bg-gray-700'
            }`}
          >
            Mascotas
          </button>
          <button
            onClick={() => setCurrentPage('owners')}
            className={`w-full text-left p-2 rounded ${
              currentPage === 'owners' ? 'bg-gray-600 text-white' : 'text-white hover:bg-gray-700'
            }`}
          >
            Propietarios
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left p-2 text-white hover:bg-red-600 rounded mt-8"
          >
            Cerrar Sesión
          </button>
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Token inválido');
          }

          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error al verificar token:', error);
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;