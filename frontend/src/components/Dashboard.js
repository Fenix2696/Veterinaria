import React, { useState, useEffect } from 'react';

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

      console.log('Token:', token); // Para debug

      try {
        if (currentPage === 'pets') {
          const response = await fetch('https://proyecto-veterinaria-uf7y.onrender.com/api/pets', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.log('Error Response:', errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          setPets(Array.isArray(data) ? data : []);
        } else if (currentPage === 'owners') {
          const response = await fetch('https://proyecto-veterinaria-uf7y.onrender.com/api/owners', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.log('Error Response:', errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          setOwners(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error completo:', err);
        setError(err.message);
        if (err.message.includes('403')) {
          console.log('Token inválido, cerrando sesión...');
          onLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentPage !== 'dashboard') {
      fetchData();
    }
  }, [currentPage, onLogout]);

  // ... resto del código del Dashboard

  const renderPetList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Mascotas</h2>
      {loading && <div className="text-center">Cargando...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
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
      {loading && <div className="text-center">Cargando...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
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

export default Dashboard;