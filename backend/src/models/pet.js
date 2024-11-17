class Pet {
  constructor(data) {
    this.validate(data);
    
    this.name = data.name.trim();
    this.species = data.species.trim();
    this.age = parseInt(data.age);
    this.owner = data.owner || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
  }

  validate(data) {
    if (!data.name?.trim()) {
      throw new Error('El nombre de la mascota es requerido');
    }
    if (!data.species?.trim()) {
      throw new Error('La especie es requerida');
    }
    if (!data.age || isNaN(parseInt(data.age))) {
      throw new Error('La edad debe ser un número válido');
    }
  }

  toJSON() {
    return {
      name: this.name,
      species: this.species,
      age: this.age,
      owner: this.owner,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }
}

module.exports = Pet;