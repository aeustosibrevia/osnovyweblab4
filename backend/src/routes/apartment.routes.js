import { Router } from 'express';
import {
  getApartments,
  getApartment,
  createApartment,
  updateApartment,
  deleteApartment
} from '../controllers/apartment.controller.js';

const router = Router();

router.get('/', getApartments);
router.get('/:id', getApartment);
router.post('/', createApartment);
router.put('/:id', updateApartment);
router.delete('/:id', deleteApartment);

export default router;
