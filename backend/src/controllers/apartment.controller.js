import { ApartmentService } from '../services/apartment.service.js';
import { validateApartment } from '../validators/apartment.validator.js';

const service = new ApartmentService();

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error('Некоректний ідентифікатор');
    error.statusCode = 400;
    throw error;
  }
  return id;
};

const sendValidationError = (res, error) => {
  res.status(400).json({
    success: false,
    message: 'Помилка валідації даних',
    errors: error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }))
  });
};

export const getApartments = (req, res, next) => {
  try {
    const apartments = service.getAll(String(req.query.search || ''));
    res.json({ success: true, data: apartments });
  } catch (error) {
    next(error);
  }
};

export const getApartment = (req, res, next) => {
  try {
    res.json({ success: true, data: service.getById(parseId(req.params.id)) });
  } catch (error) {
    next(error);
  }
};

export const createApartment = (req, res, next) => {
  const result = validateApartment(req.body);
  if (!result.success) return sendValidationError(res, result.error);

  try {
    res.status(201).json({
      success: true,
      message: 'Квартиру успішно додано',
      data: service.create(result.data)
    });
  } catch (error) {
    next(error);
  }
};

export const updateApartment = (req, res, next) => {
  const result = validateApartment(req.body);
  if (!result.success) return sendValidationError(res, result.error);

  try {
    res.json({
      success: true,
      message: 'Дані квартири оновлено',
      data: service.update(parseId(req.params.id), result.data)
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApartment = (req, res, next) => {
  try {
    service.delete(parseId(req.params.id));
    res.json({ success: true, message: 'Квартиру видалено' });
  } catch (error) {
    next(error);
  }
};
