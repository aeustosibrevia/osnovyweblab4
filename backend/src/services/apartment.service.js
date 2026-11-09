import { ApartmentRepository } from '../repositories/apartment.repository.js';

export class ApartmentService {
  constructor() {
    this.repository = new ApartmentRepository();
  }

  getAll(search) {
    return this.repository.findAll(search);
  }

  getById(id) {
    const apartment = this.repository.findById(id);
    if (!apartment) {
      const error = new Error('Квартиру не знайдено');
      error.statusCode = 404;
      throw error;
    }
    return apartment;
  }

  create(data) {
    return this.repository.create(data);
  }

  update(id, data) {
    this.getById(id);
    return this.repository.update(id, data);
  }

  delete(id) {
    this.getById(id);
    this.repository.delete(id);
  }
}
