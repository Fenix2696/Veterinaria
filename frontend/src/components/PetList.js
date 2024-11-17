import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import PetForm from './PetForm';

const API_URL = 'https://proyecto-veterinaria-uf7y.onrender.com/api';

const PetList = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  const fetchPets = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch(`${API_URL}/pets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar mascotas');
      }
  
      if (!data.success) {
        throw new Error(data.message || 'Error al obtener los datos');
      }
  
      setPets(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Error al cargar mascotas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al crear mascota');
      }

      fetchPets();
      setIsModalOpen(false);
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const handleUpdate = async (formData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/pets/${selectedPet._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar mascota');
      }

      fetchPets();
      setIsModalOpen(false);
      setSelectedPet(null);
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/pets/${petToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar mascota');
      }

      fetchPets();
      setIsDeleteModalOpen(false);
      setPetToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mascotas</h2>
        <button
          onClick={() => {
            setSelectedPet(null);
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
                        setSelectedPet(pet);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setPetToDelete(pet);
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPet(null);
        }}
        title={selectedPet ? 'Editar Mascota' : 'Agregar Mascota'}
      >
        <PetForm
          pet={selectedPet}
          onSubmit={selectedPet ? handleUpdate : handleCreate}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPet(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPetToDelete(null);
        }}
        title="Confirmar Eliminación"
      >
        <div className="p-6">
          <p className="mb-6">¿Estás seguro de que deseas eliminar esta mascota?</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setPetToDelete(null);
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

export default PetList;