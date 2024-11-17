import React, { useState } from 'react';

const PetForm = ({ pet, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: pet?.name || '',
    species: pet?.species || '',
    age: pet?.age || '',
    owner: pet?.owner || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      if (!formData.name || !formData.species || !formData.age) {
        throw new Error('Todos los campos son requeridos');
      }
  
      await onSubmit({
        ...formData,
        age: parseInt(formData.age)
      });
    } catch (err) {
      console.error('Error en el formulario:', err);
      setError(err.message || 'Error al procesar el formulario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Especie</label>
        <input
          type="text"
          value={formData.species}
          onChange={(e) => setFormData({ ...formData, species: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Edad</label>
        <input
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
        >
          {loading ? 'Guardando...' : pet ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default PetForm;