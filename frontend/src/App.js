import React, { useState, useEffect } from 'react';
import './App.css';

const LoginForm = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        onLoginSuccess();
      } else {
        setError('Credenciales inválidas');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Inicio de Sesión</h2>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={credentials.email}
            onChange={e => setCredentials({...credentials, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-2 border rounded"
            value={credentials.password}
            onChange={e => setCredentials({...credentials, password: e.target.value})}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Ingresar
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

  useEffect(() => {
    if (currentPage === 'pets') {
      fetch('http://localhost:5000/api/pets')
        .then(res => res.json())
        .then(data => setPets(data))
        .catch(error => console.error('Error:', error));
    } else if (currentPage === 'owners') {
      fetch('http://localhost:5000/api/owners')
        .then(res => res.json())
        .then(data => setOwners(data))
        .catch(error => console.error('Error:', error));
    }
  }, [currentPage]);

  const renderPetList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Mascotas</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Especie</th>
              <th className="px-6 py-3 text-left">Edad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pets.map(pet => (
              <tr key={pet._id}>
                <td className="px-6 py-4">{pet.name}</td>
                <td className="px-6 py-4">{pet.species}</td>
                <td className="px-6 py-4">{pet.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOwnerList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Propietarios</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Teléfono</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {owners.map(owner => (
              <tr key={owner._id}>
                <td className="px-6 py-4">{owner.name}</td>
                <td className="px-6 py-4">{owner.email}</td>
                <td className="px-6 py-4">{owner.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
            <h2 className="text-2xl font-bold">Bienvenido al Sistema Veterinario</h2>
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
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
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