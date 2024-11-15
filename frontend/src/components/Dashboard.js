import React, { useState, useEffect } from 'react';

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

export default Dashboard;