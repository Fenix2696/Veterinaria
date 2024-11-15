import React, { useState, useEffect } from 'react';

const PetList = () => {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/pets')
      .then(res => res.json())
      .then(data => setPets(data))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
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
};

export default PetList;