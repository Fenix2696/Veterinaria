// src/models/item.js
class Item {
  constructor(data) {
    this.validate(data);
    
    this.name = data.name.trim();
    this.description = data.description?.trim() || '';
    this.quantity = parseInt(data.quantity);
    this.price = parseFloat(data.price);
    this.category = data.category?.trim() || 'General';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
  }

  validate(data) {
    if (!data.name?.trim()) {
      throw new Error('El nombre del item es requerido');
    }
    if (!data.quantity || isNaN(parseInt(data.quantity))) {
      throw new Error('La cantidad debe ser un número válido');
    }
    if (!data.price || isNaN(parseFloat(data.price))) {
      throw new Error('El precio debe ser un número válido');
    }
    if (data.quantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }
    if (data.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      quantity: this.quantity,
      price: this.price,
      category: this.category,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }
}

module.exports = Item;