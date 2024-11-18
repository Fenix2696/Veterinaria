class Veterinarian {
    constructor(data) {
        this.validate(data);
        
        this.name = data.name.trim();
        this.email = data.email.toLowerCase();
        this.phone = data.phone;
        this.specialty = data.specialty?.trim() || 'General';
        this.license = data.license?.trim();
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.createdBy = data.createdBy;
        this.updatedBy = data.updatedBy;
    }

    validate(data) {
        if (!data.name?.trim()) {
            throw new Error('El nombre del veterinario es requerido');
        }
        if (!data.email || !this.validateEmail(data.email)) {
            throw new Error('Email inválido');
        }
        if (!data.phone || typeof data.phone !== 'string') {
            throw new Error('Teléfono inválido');
        }
        if (!data.license?.trim()) {
            throw new Error('El número de licencia es requerido');
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
            specialty: this.specialty,
            license: this.license,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy
        };
    }
}

module.exports = Veterinarian;