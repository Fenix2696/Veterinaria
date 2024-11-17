import React, { useState, useEffect } from 'react';
import './App.css';
import dashboardGif from './assets/images/dashboard.gif';
import Modal from './components/Modal';
import PetForm from './components/PetForm';
import OwnerForm from './components/OwnerForm';

const API_URL = 'https://proyecto-veterinaria-uf7y.onrender.com/api';

const Dashboard = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
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
      let endpoint = currentPage === 'pets' ? '/pets' : '/owners';
      
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

      if (currentPage === 'pets') {
        setPets(data.data || []);
      } else {
        setOwners(data.data || []);
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
      const endpoint = currentPage === 'pets' ? '/pets' : '/owners';
      
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
      const endpoint = currentPage === 'pets' ? '/pets' : '/owners';
      
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
      const endpoint = currentPage === 'pets' ? '/pets' : '/owners';
      
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                <tr key={pet._id}>
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

  // ... Continúa con el renderOwnerList y el resto del Dashboard ...

  const renderOwnerList = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Propietarios</h2>
        <button
          onClick={() => {
            setSelectedItem(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                <tr key={owner._id}>
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

  const renderContent = () => {
    switch(currentPage) {
      case 'pets':
        return renderPetList();
      case 'owners':
        return renderOwnerList();
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
                className="rounded-lg shadow-lg max-w-xl w-full mb-6"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-xl text-gray-600 mb-8">
                  Sistema integral para la gestión de tu clínica veterinaria
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Gestión de Mascotas
                    </h3>
                    <p className="text-blue-600">
                      Registra y administra la información de todas las mascotas
                    </p>
                  </div>
                  <div className="p-6 bg-green-50 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Gestión de Propietarios
                    </h3>
                    <p className="text-green-600">
                      Mantén actualizada la información de los propietarios
                    </p>
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

      {/* Modales para crear/editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        title={`${selectedItem ? 'Editar' : 'Agregar'} ${
          currentPage === 'pets' ? 'Mascota' : 'Propietario'
        }`}
      >
        {currentPage === 'pets' ? (
          <PetForm
            pet={selectedItem}
            onSubmit={selectedItem ? handleUpdate : handleCreate}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedItem(null);
            }}
          />
        ) : (
          <OwnerForm
            owner={selectedItem}
            onSubmit={selectedItem ? handleUpdate : handleCreate}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedItem(null);
            }}
          />
        )}
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
            ¿Estás seguro de que deseas eliminar este {currentPage === 'pets' ? 'mascota' : 'propietario'}?
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
            // Opcional: Recargar los datos al iniciar sesión
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
}

export default App;