import React, { useState, useEffect } from 'react';
import './App.css';
import dashboardGif from './assets/images/dashboard.gif';
import Modal from './components/Modal';
import PetForm from './components/PetForm';
import OwnerForm from './components/OwnerForm';
import ItemForm from './components/ItemForm';
import VeterinarianForm from './components/VeterinarianForm';
import LoginForm from './components/LoginForm';

const API_URL = 'https://proyecto-veterinaria-uf7y.onrender.com/api';

const Dashboard = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [items, setItems] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    if (!token) {
      onLogout();
      return;
    }

    try {
      let endpoint;
      switch(currentPage) {
        case 'pets':
          endpoint = '/pets';
          break;
        case 'owners':
          endpoint = '/owners';
          break;
        case 'items':
          endpoint = '/items';
          break;
        case 'veterinarians':
          endpoint = '/veterinarians';
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
          onLogout();
          throw new Error('Sesión expirada');
        }
        throw new Error(`Error al cargar ${currentPage}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || `Error al cargar ${currentPage}`);
      }

      switch(currentPage) {
        case 'pets':
          setPets(data.data || []);
          break;
        case 'owners':
          setOwners(data.data || []);
          break;
        case 'items':
          setItems(data.data || []);
          break;
        case 'veterinarians':
          setVeterinarians(data.data || []);
          break;
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage !== 'dashboard') {
      fetchData();
    }
  }, [currentPage]);

  const handleCreate = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint;
      switch(currentPage) {
        case 'pets':
          endpoint = '/pets';
          break;
        case 'owners':
          endpoint = '/owners';
          break;
        case 'items':
          endpoint = '/items';
          break;
        case 'veterinarians':
          endpoint = '/veterinarians';
          break;
        default:
          throw new Error('Página no válida');
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear');
      }

      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al crear:', error);
      setError(error.message);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint;
      switch(currentPage) {
        case 'pets':
          endpoint = '/pets';
          break;
        case 'owners':
          endpoint = '/owners';
          break;
        case 'items':
          endpoint = '/items';
          break;
        case 'veterinarians':
          endpoint = '/veterinarians';
          break;
        default:
          throw new Error('Página no válida');
      }
      
      const response = await fetch(`${API_URL}${endpoint}/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar');
      }

      fetchData();
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error al actualizar:', error);
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint;
      switch(currentPage) {
        case 'pets':
          endpoint = '/pets';
          break;
        case 'owners':
          endpoint = '/owners';
          break;
        case 'items':
          endpoint = '/items';
          break;
        case 'veterinarians':
          endpoint = '/veterinarians';
          break;
        default:
          throw new Error('Página no válida');
      }
      
      const response = await fetch(`${API_URL}${endpoint}/${itemToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar');
      }

      fetchData();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setError(error.message);
    }
  };


  const renderPetList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mascotas</h2>
        <button
          onClick={() => {
            setSelectedItem(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
        >
          Agregar Mascota
        </button>
      </div>

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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pets.map((pet) => (
                <tr key={pet._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{pet.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{pet.species}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{pet.age}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedItem(pet);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(pet);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </td>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Propietarios</h2>
        <button
          onClick={() => {
            setSelectedItem(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
        >
          Agregar Propietario
        </button>
      </div>

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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {owners.map((owner) => (
                <tr key={owner._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{owner.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{owner.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{owner.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedItem(owner);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(owner);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderItemList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Inventario</h2>
          <p className="text-sm text-gray-600 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} en total
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedItem(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
            />
          </svg>
          Agregar Item
        </button>
      </div>
  
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
  
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <div className="flex">
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
  
      {!loading && !error && items.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay items</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza agregando un nuevo item al inventario.
          </p>
        </div>
      ) : !loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name || 'Sin nombre'}
                    </div>
                    {item.description && (
                      <div className="text-sm text-gray-500">
                        {item.description.length > 50 
                          ? `${item.description.substring(0, 50)}...` 
                          : item.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (item.quantity || 0) === 0
                        ? 'bg-red-100 text-red-800'
                        : (item.quantity || 0) < 10
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.quantity || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category || 'General'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderVeterinarianList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Veterinarios</h2>
        <button
          onClick={() => {
            setSelectedItem(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
        >
          Agregar Veterinario
        </button>
      </div>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {veterinarians.map((vet) => (
                <tr key={vet._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{vet.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vet.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vet.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vet.specialty}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedItem(vet);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(vet);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </td>
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
      case 'items':
        return renderItemList();
      case 'veterinarians':
        return renderVeterinarianList();
      default:
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
              Bienvenido al Sistema Veterinario
            </h2>
            <div className="flex flex-col items-center">
              <img
                src={dashboardGif}
                alt="Bienvenida Veterinaria"
                className="rounded-lg shadow-lg max-w-xl w-full mb-6 object-cover"
                style={{ maxHeight: '400px' }}
              />
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-xl text-gray-600 mb-8">
                  Sistema integral para la gestión de tu clínica veterinaria
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="transform transition-all duration-300 hover:scale-105">
                    <div className="p-6 bg-blue-50 rounded-xl shadow-md hover:shadow-lg border border-blue-100">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        Gestión de Mascotas
                      </h3>
                      <p className="text-blue-600">
                        Registra y administra la información de todas las mascotas
                      </p>
                    </div>
                  </div>
                  <div className="transform transition-all duration-300 hover:scale-105">
                    <div className="p-6 bg-green-50 rounded-xl shadow-md hover:shadow-lg border border-green-100">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Gestión de Propietarios
                      </h3>
                      <p className="text-green-600">
                        Mantén actualizada la información de los propietarios
                      </p>
                    </div>
                  </div>
                  <div className="transform transition-all duration-300 hover:scale-105">
                    <div className="p-6 bg-yellow-50 rounded-xl shadow-md hover:shadow-lg border border-yellow-100">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                        Gestión de Inventario
                      </h3>
                      <p className="text-yellow-600">
                        Controla el inventario de productos y medicamentos
                      </p>
                    </div>
                  </div>
                  <div className="transform transition-all duration-300 hover:scale-105">
                    <div className="p-6 bg-purple-50 rounded-xl shadow-md hover:shadow-lg border border-purple-100">
                      <h3 className="text-lg font-semibold text-purple-800 mb-2">
                        Gestión de Veterinarios
                      </h3>
                      <p className="text-purple-600">
                        Administra el equipo médico de la clínica
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1 className="text-white text-xl font-bold text-center py-4">
              Veterinaria
            </h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                currentPage === 'dashboard' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => setCurrentPage('pets')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                currentPage === 'pets' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              Mascotas
            </button>

            <button
              onClick={() => setCurrentPage('owners')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                currentPage === 'owners' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Propietarios
            </button>

            <button
              onClick={() => setCurrentPage('items')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                currentPage === 'items' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Inventario
            </button>

            <button
              onClick={() => setCurrentPage('veterinarians')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                currentPage === 'veterinarians' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Veterinarios
            </button>
          </nav>

          <div className="p-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </div>

      {/* Modal para crear/editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        title={`${selectedItem ? 'Editar' : 'Agregar'} ${
          currentPage === 'pets' ? 'Mascota' : 
          currentPage === 'owners' ? 'Propietario' :
          currentPage === 'items' ? 'Item' : 'Veterinario'
        }`}
      >
        {(() => {
          switch(currentPage) {
            case 'pets':
              return (
                <PetForm
                  pet={selectedItem}
                  onSubmit={selectedItem ? handleUpdate : handleCreate}
                  onClose={() => {
                    setIsModalOpen(false);
                    setSelectedItem(null);
                  }}
                />
              );
            case 'owners':
              return (
                <OwnerForm
                  owner={selectedItem}
                  onSubmit={selectedItem ? handleUpdate : handleCreate}
                  onClose={() => {
                    setIsModalOpen(false);
                    setSelectedItem(null);
                  }}
                />
              );
            case 'items':
              return (
                <ItemForm
                  item={selectedItem}
                  onSubmit={selectedItem ? handleUpdate : handleCreate}
                  onClose={() => {
                    setIsModalOpen(false);
                    setSelectedItem(null);
                  }}
                />
              );
            case 'veterinarians':
              return (
                <VeterinarianForm
                  veterinarian={selectedItem}
                  onSubmit={selectedItem ? handleUpdate : handleCreate}
                  onClose={() => {
                    setIsModalOpen(false);
                    setSelectedItem(null);
                  }}
                />
              );
            default:
              return null;
          }
        })()}
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        title="Confirmar Eliminación"
      >
        <div className="p-6">
          <p className="mb-6">
            ¿Estás seguro de que deseas eliminar {
              currentPage === 'pets' ? 'esta mascota' : 
              currentPage === 'owners' ? 'este propietario' :
              currentPage === 'items' ? 'este item' : 'este veterinario'
            }?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Error de verificación');
          }

          if (data.success) {
            setIsLoggedIn(true);
          } else {
            throw new Error('Verificación fallida');
          }
        } catch (error) {
          console.error('Error al verificar token:', error);
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginForm 
          onLoginSuccess={() => {
            setIsLoggedIn(true);
          }} 
        />
      )}
    </div>
  );
}

export default App;