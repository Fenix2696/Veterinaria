class Pet {
    constructor(data) {
      this.validate(data);
      
      this.name = data.name;
      this.species = data.species;
      this.age = parseInt(data.age);
      this.owner = data.owner || null;
      this.createdAt = data.createdAt || new Date();
      this.updatedAt = data.updatedAt || new Date();
      this.createdBy = data.createdBy;
      this.updatedBy = data.updatedBy;
    }
  
    validate(data) {
      if (!data.name || typeof data.name !== 'string') {
        throw new Error('Nombre de mascota inválido');
      }
      if (!data.species || typeof data.species !== 'string') {
        throw new Error('Especie inválida');
      }
      if (!data.age || isNaN(parseInt(data.age))) {
        throw new Error('Edad inválida');
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