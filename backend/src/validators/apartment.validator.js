import { z } from 'zod';

const apartmentSchema = z.object({
  district: z.string().trim().min(2, 'Район має містити щонайменше 2 символи').max(100),
  address: z.string().trim().min(5, 'Вкажіть повну адресу').max(200),
  floor: z.coerce.number().int().min(1).max(100),
  area: z.coerce.number().positive().max(10000),
  rooms: z.coerce.number().int().min(1).max(20),
  ownerName: z.string().trim().min(2).max(100),
  ownerPhone: z.string().trim().min(7).max(25).regex(/^[+()\-\d\s]+$/, 'Некоректний номер телефону'),
  price: z.coerce.number().positive().max(1000000000)
});

export const validateApartment = (data) => apartmentSchema.safeParse(data);
