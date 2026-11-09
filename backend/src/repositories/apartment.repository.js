import database from '../database/database.js';

const columns = `
  id, district, address, floor, area, rooms,
  owner_name AS ownerName, owner_phone AS ownerPhone,
  price, created_at AS createdAt, updated_at AS updatedAt
`;

export class ApartmentRepository {
  findAll(search = '') {
    if (!search.trim()) {
      return database.prepare(`SELECT ${columns} FROM apartments ORDER BY id DESC`).all();
    }

    const term = `%${search.trim()}%`;
    return database.prepare(`
      SELECT ${columns}
      FROM apartments
      WHERE district LIKE ? OR address LIKE ? OR owner_name LIKE ?
      ORDER BY id DESC
    `).all(term, term, term);
  }

  findById(id) {
    return database.prepare(`SELECT ${columns} FROM apartments WHERE id = ?`).get(id);
  }

  create(apartment) {
    const result = database.prepare(`
      INSERT INTO apartments (
        district, address, floor, area, rooms, owner_name, owner_phone, price
      ) VALUES (
        @district, @address, @floor, @area, @rooms, @ownerName, @ownerPhone, @price
      )
    `).run(apartment);

    return this.findById(Number(result.lastInsertRowid));
  }

  update(id, apartment) {
    database.prepare(`
      UPDATE apartments
      SET district = @district,
          address = @address,
          floor = @floor,
          area = @area,
          rooms = @rooms,
          owner_name = @ownerName,
          owner_phone = @ownerPhone,
          price = @price,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `).run({ ...apartment, id });

    return this.findById(id);
  }

  delete(id) {
    return database.prepare('DELETE FROM apartments WHERE id = ?').run(id).changes > 0;
  }
}
