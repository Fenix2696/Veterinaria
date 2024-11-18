import React, { useState, useEffect } from 'react';

const ItemForm = ({ item, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    category: 'General'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        price: item.price || 0,
        category: item.category || 'General'
      });
    }
  }, [item]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      throw new Error('El nombre del item es requerido');
    }
    if (isNaN(formData.quantity) || formData.quantity < 0) {
      throw new Error('La cantidad debe ser un número válido y no negativo');
    }
    if (isNaN(formData.price) || formData.price < 0) {
      throw new Error('El precio debe ser un número válido y no negativo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      validateForm();
      const normalizedData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        category: formData.category.trim()
      };
      await onSubmit(normalizedData);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleNumberInput = (e, field) => {
    const value = e.target.value;
    if (value === '' || value === '-') {
      setFormData({ ...formData, [field]: value });
      return;
    }
    const num = field === 'price' ? parseFloat(value) : parseInt(value);
    if (!isNaN(num)) {
      setFormData({ ...formData, [field]: num });
    }
  };

  const categories = [
    'General',
    'Medicamentos',
    'Alimentos',
    'Accesorios',
    'Higiene',
    'Equipamiento',
    'Suplementos',
    'Juguetes',
    'Cuidado Dental'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          maxLength={100}
          placeholder="Nombre del producto"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows="3"
          maxLength={500}
          placeholder="Descripción detallada del producto"
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/500 caracteres
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cantidad <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => handleNumberInput(e, 'quantity')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          min="0"
          step="1"
          placeholder="0"
        />
        <p className="mt-1 text-sm text-gray-500">
          Cantidad disponible en inventario
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Precio <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">$</span>
          </div>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleNumberInput(e, 'price')}
            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Precio unitario del producto
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Categoría</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? 'Guardando...' : item ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default ItemForm;