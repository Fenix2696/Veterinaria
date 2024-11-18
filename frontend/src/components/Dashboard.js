import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import PetForm from './PetForm';
import OwnerForm from './OwnerForm';
import ItemForm from './ItemForm';
import VeterinarianForm from './VeterinarianForm';
import dashboardGif from '../assets/images/dashboard.gif';

const API_URL = 'https://proyecto-veterinaria-uf7y.onrender.com/api';

const Dashboard = ({ onLogout }) => {
  // Estados
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

  // Efecto para verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No hay token');
      onLogout();
    }
  }, [onLogout]);

  // Efecto para cargar datos según la página actual
  useEffect(() => {
    if (currentPage !== 'dashboard') {
      fetchData();
    }
  }, [currentPage]);

  // Función para obtener datos
  const fetchData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
  
    try {
      let endpoint = '';
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
        throw new Error(`Error al cargar ${endpoint}`);
      }
  
      const data = await response.json();
      
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

  // Función para crear nuevo item
  const handleCreate = async (formData) => {
    const token = localStorage.getItem('token');
    let endpoint = '';
    
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

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al crear');
      }

      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  // Función para actualizar item
  const handleUpdate = async (formData) => {
    const token = localStorage.getItem('token');
    let endpoint = '';
    
    switch(currentPage) {
      case 'pets':
        endpoint = `/pets/${selectedItem._id}`;
        break;
      case 'owners':
        endpoint = `/owners/${selectedItem._id}`;
        break;
      case 'items':
        endpoint = `/items/${selectedItem._id}`;
        break;
      case 'veterinarians':
        endpoint = `/veterinarians/${selectedItem._id}`;
        break;
      default:
        return;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar');
      }

      fetchData();
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  // Función para eliminar item
  const handleDelete = async () => {
    if (!itemToDelete) return;

    const token = localStorage.getItem('token');
    let endpoint = '';
    
    switch(currentPage) {
      case 'pets':
        endpoint = `/pets/${itemToDelete._id}`;
        break;
      case 'owners':
        endpoint = `/owners/${itemToDelete._id}`;
        break;
      case 'items':
        endpoint = `/items/${itemToDelete._id}`;
        break;
      case 'veterinarians':
        endpoint = `/veterinarians/${itemToDelete._id}`;
        break;
      default:
        return;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      fetchData();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  // Renderizado de listas
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
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(pet);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
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
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(owner);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
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
        <h2 className="text-2xl font-bold">Inventario</h2>
        <button
          onClick={() => {
            setSelectedItem(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
        >
          Agregar Item
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
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
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
                  Especialidad
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
              {veterinarians.map((vet) => (
                <tr key={vet._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{vet.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vet.specialty}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vet.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vet.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedItem(vet);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(vet);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
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

  // Renderizado del contenido principal
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
              <div className="relative w-full max-w-4xl mb-8">
                <img
                  src={dashboardGif}
                  alt="Bienvenida a la Veterinaria"
                  className="w-full h-[400px] object-cover rounded-lg shadow-xl"
                  style={{
                    maxHeight: '400px',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
              </div>
              
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-xl text-gray-600 mb-8">
                  Sistema integral para la gestión de tu clínica veterinaria
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="transform transition-all duration-300 hover:scale-105">
                    <div className="p-6 bg-blue-50 rounded-xl shadow-md hover:shadow-lg border border-blue-100">
                      <div className="text-blue-600 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-blue-800 mb-2">
                        Gestión de Mascotas
                      </h3>
                      <p className="text-blue-600">
                        Administra el registro completo de pacientes
                      </p>
                    </div>
                  </div>

                  <div className="transform transition-all duration-300 hover:scale-105">
                    <div className="p-6 bg-green-50 rounded-xl shadow-md hover:shadow-lg border border-green-100">
                      <div className="text-green-600 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">
                        Gestión de Propietarios
                      </h3>
                      <p className="text-green-600">
                        Control detallado de información de clientes
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
          <div className="flex items-center justify-center h-16 bg-gray-900">
            <h1 className="text-white text-xl font-bold">Veterinaria</h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                currentPage === 'dashboard' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {renderContent()}
      </div>

      {/* Modales */}
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

export default Dashboard;