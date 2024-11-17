class Owner {
    constructor(data) {
      this.validate(data);
      
      this.name = data.name;
      this.email = data.email.toLowerCase();
      this.phone = data.phone;
      this.address = data.address || '';
      this.createdAt = data.createdAt || new Date();
      this.updatedAt = data.updatedAt || new Date();
      this.createdBy = data.createdBy;
      this.updatedBy = data.updatedBy;
    }
  
    validate(data) {
      if (!data.name || typeof data.name !== 'string') {
        throw new Error('Nombre de propietario inválido');
      }
      if (!data.email || !this.validateEmail(data.email)) {
        throw new Error('Email inválido');
      }
      if (!data.phone || typeof data.phone !== 'string') {
        throw new Error('Teléfono inválido');
      }
    }
  
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    toJSON() {
      return {
        name: this.name,
        email: this.email,
        phone: this.phone,
        address: this.address,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        createdBy: this.createdBy,
        updatedBy: this.updatedBy
      };
    }
  }
  
  module.exports = Owner;