// MongoDB Playground
use('mi_base_de_datos');

// Eliminar la colección existente si existe
db.veterinarians.drop();

// Crear la colección
db.createCollection('veterinarians', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'phone', 'specialty', 'license'],
            properties: {
                name: {
                    bsonType: 'string',
                    description: 'Nombre del veterinario - requerido'
                },
                email: {
                    bsonType: 'string',
                    description: 'Email del veterinario - requerido'
                },
                phone: {
                    bsonType: 'string',
                    description: 'Teléfono del veterinario - requerido'
                },
                specialty: {
                    enum: ['General', 'Cirugía', 'Dermatología', 'Cardiología', 'Oftalmología'],
                    description: 'Especialidad del veterinario - debe ser una de las especialidades permitidas'
                },
                license: {
                    bsonType: 'string',
                    description: 'Número de licencia - requerido'
                }
            }
        }
    }
});

// Crear índices únicos
db.veterinarians.createIndex({ "email": 1 }, { unique: true });
db.veterinarians.createIndex({ "license": 1 }, { unique: true });

// Insertar datos
db.veterinarians.insertMany([
    {
        "name": "Dr. Juan Pérez",
        "email": "juan.perez@veterinaria.com",
        "phone": "555-0101",
        "specialty": "Cirugía",
        "license": "VET001"
    },
    {
        "name": "Dra. María García",
        "email": "maria.garcia@veterinaria.com",
        "phone": "555-0102",
        "specialty": "Dermatología",
        "license": "VET002"
    },
    {
        "name": "Dr. Carlos Rodríguez",
        "email": "carlos.rodriguez@veterinaria.com",
        "phone": "555-0103",
        "specialty": "General",
        "license": "VET003"
    },
    {
        "name": "Dra. Ana Martínez",
        "email": "ana.martinez@veterinaria.com",
        "phone": "555-0104",
        "specialty": "Oftalmología",
        "license": "VET004"
    },
    {
        "name": "Dr. Luis González",
        "email": "luis.gonzalez@veterinaria.com",
        "phone": "555-0105",
        "specialty": "Cardiología",
        "license": "VET005"
    },
    {
        "name": "Dra. Patricia Sánchez",
        "email": "patricia.sanchez@veterinaria.com",
        "phone": "555-0106",
        "specialty": "Cirugía",
        "license": "VET006"
    },
    {
        "name": "Dr. Roberto Torres",
        "email": "roberto.torres@veterinaria.com",
        "phone": "555-0107",
        "specialty": "General",
        "license": "VET007"
    },
    {
        "name": "Dra. Laura Díaz",
        "email": "laura.diaz@veterinaria.com",
        "phone": "555-0108",
        "specialty": "Dermatología",
        "license": "VET008"
    }
]);

// Verificar los datos insertados
print("\nVeterinarios insertados:");
db.veterinarians.find().forEach(printjson);

// Mostrar el total de veterinarios
print("\nTotal de veterinarios:", db.veterinarians.countDocuments());