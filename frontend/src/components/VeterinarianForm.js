import React, { useState, useEffect } from 'react';

const VeterinarianForm = ({ veterinarian, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialty: 'General',
        license: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (veterinarian) {
            setFormData({
                name: veterinarian.name || '',
                email: veterinarian.email || '',
                phone: veterinarian.phone || '',
                specialty: veterinarian.specialty || 'General',
                license: veterinarian.license || ''
            });
        }
    }, [veterinarian]);

    const validateForm = () => {
        if (!formData.name.trim()) {
            throw new Error('El nombre del veterinario es requerido');
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            throw new Error('Email inválido');
        }
        if (!formData.phone.trim() || formData.phone.length < 8) {
            throw new Error('Teléfono inválido - mínimo 8 dígitos');
        }
        if (!formData.license.trim()) {
            throw new Error('El número de licencia es requerido');
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
                email: formData.email.toLowerCase(),
                name: formData.name.trim(),
                license: formData.license.trim(),
                phone: formData.phone.trim(),
                specialty: formData.specialty.trim()
            };
            await onSubmit(normalizedData);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9+()-]/g, '');
        if (value.length <= 15) {
            setFormData({ ...formData, phone: value });
        }
    };

    const specialties = [
        'General',
        'Cirugía',
        'Dermatología',
        'Cardiología',
        'Oftalmología',
        'Ortopedia',
        'Neurología',
        'Odontología',
        'Nutrición',
        'Medicina Interna',
        'Oncología'
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
                    placeholder="Nombre completo"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    placeholder="correo@ejemplo.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    placeholder="+1234567890"
                />
                <p className="mt-1 text-sm text-gray-500">
                    Solo números y los caracteres: + ( ) -
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Especialidad
                </label>
                <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    {specialties.map((specialty) => (
                        <option key={specialty} value={specialty}>
                            {specialty}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Número de Licencia <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.license}
                    onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    maxLength={50}
                    placeholder="Ejemplo: VET-12345"
                />
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
                    {loading ? 'Guardando...' : veterinarian ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    );
};

export default VeterinarianForm;