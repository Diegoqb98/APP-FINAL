const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./src/db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET || 'development-secret';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function parseDate(dateText) {
  if (!dateText) return null;
  const value = new Date(dateText);
  return Number.isNaN(value.getTime()) ? null : dateText;
}

function isValidRange(checkInDate, checkOutDate) {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start < end;
}

function signUser(user) {
  const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

function adminRequired(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso restringido a administradores' });
  }

  return next();
}

async function getRoomAvailability(checkInDate, checkOutDate) {
  const { rows } = await pool.query(
    `SELECT
       r.*,
       h.name AS hotel_name,
       NOT EXISTS (
         SELECT 1
         FROM reservations res
         WHERE res.room_id = r.id
           AND res.status <> 'cancelled'
           AND res.check_in_date < $2::date
           AND res.check_out_date > $1::date
       ) AS available
     FROM rooms r
     JOIN hotels h ON h.id = r.hotel_id
     WHERE r.is_active = true
     ORDER BY h.name, r.number ASC`,
    [checkInDate, checkOutDate]
  );

  return rows;
}

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotels (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      city VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'client',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
      number VARCHAR(20) NOT NULL,
      type VARCHAR(60) NOT NULL,
      capacity INTEGER NOT NULL CHECK (capacity > 0),
      price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(hotel_id, number)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
      guest_name VARCHAR(60) NOT NULL,
      guest_lastname VARCHAR(60) NOT NULL,
      check_in_date DATE NOT NULL,
      check_out_date DATE NOT NULL,
      guests INTEGER NOT NULL CHECK (guests > 0),
      notes TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
      total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CHECK (check_in_date < check_out_date)
    )
  `);

  const adminCount = await pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`);
  if (adminCount.rows[0].count === 0) {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')`,
      ['Administrador', 'admin@hotel.local', passwordHash]
    );
  }

  const hotelCount = await pool.query(`SELECT COUNT(*)::int AS count FROM hotels`);
  if (hotelCount.rows[0].count === 0) {
    const hotels = [
      ['Gran Hotel Madrid', 'Madrid', 'Paseo del Prado 123', 'Hotel de lujo en el centro de Madrid con vistas a museos.'],
      ['Hotel Barcelona Beachfront', 'Barcelona', 'Paseo Marítimo 456', 'Hotel frente al mar con acceso directo a la playa.'],
      ['Hotel Sevilla Clásico', 'Sevilla', 'Plaza de España 789', 'Hotel histórico con arquitectura tradicional andaluza.'],
      ['Hotel Valencia Moderno', 'Valencia', 'Calle Colón 321', 'Hotel moderno con piscina y spa completo.'],
      ['Hotel Bilbao Arts', 'Bilbao', 'Avenida del Guggenheim 654', 'Hotel boutique cerca del Museo Guggenheim.']
    ];

    for (const hotel of hotels) {
      await pool.query(
        `INSERT INTO hotels (name, city, address, description) VALUES ($1, $2, $3, $4)`,
        hotel
      );
    }
  }

  const roomCount = await pool.query(`SELECT COUNT(*)::int AS count FROM rooms`);
  if (roomCount.rows[0].count === 0) {
    const sampleRooms = [
      [1, '101', 'Individual', 1, 65.0, 'Habitación individual con baño privado.'],
      [1, '102', 'Doble', 2, 89.0, 'Habitación doble con cama king size.'],
      [1, '201', 'Suite', 4, 150.0, 'Suite con zona de estar y vistas al Prado.'],
      [1, '202', 'Familiar', 4, 135.0, 'Habitación amplia para familias.'],
      [2, '101', 'Individual', 1, 75.0, 'Habitación con vistas al mar.'],
      [2, '102', 'Doble', 2, 99.0, 'Habitación doble frente a la playa.'],
      [2, '201', 'Suite', 4, 180.0, 'Suite premium con balcón al mar.'],
      [3, '101', 'Individual', 1, 55.0, 'Habitación con estilo tradicional.'],
      [3, '102', 'Doble', 2, 79.0, 'Habitación doble con decoración andaluza.'],
      [3, '201', 'Suite', 4, 140.0, 'Suite con patio interior.'],
      [4, '101', 'Individual', 1, 70.0, 'Habitación moderna con tecnología smart.'],
      [4, '102', 'Doble', 2, 95.0, 'Habitación doble con acceso a spa.'],
      [4, '201', 'Suite', 4, 160.0, 'Suite deluxe con piscina privada.'],
      [5, '101', 'Individual', 1, 80.0, 'Habitación art deco cerca del Guggenheim.'],
      [5, '102', 'Doble', 2, 110.0, 'Habitación doble design.'],
      [5, '201', 'Suite', 4, 170.0, 'Suite artística con galería privada.']
    ];

    for (const room of sampleRooms) {
      await pool.query(
        `INSERT INTO rooms (hotel_id, number, type, capacity, price_per_night, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        room
      );
    }
  }
}

async function waitForDatabase(maxAttempts = 10, delayMs = 2000) {
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      attempt += 1;
      if (attempt >= maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'hotel-reservations-api' });
});

app.get('/api/stats', asyncHandler(async (req, res) => {
  const [users, rooms, reservations] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total FROM users'),
    pool.query('SELECT COUNT(*)::int AS total FROM rooms WHERE is_active = true'),
    pool.query("SELECT COUNT(*)::int AS total FROM reservations WHERE status = 'confirmed'"),
  ]);

  return res.json({
    users: users.rows[0].total,
    rooms: rooms.rows[0].total,
    reservations: reservations.rows[0].total,
  });
}));

app.get('/api/hotels', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, city, address, description FROM hotels WHERE is_active = true ORDER BY name ASC'
  );
  return res.json({ hotels: rows });
}));

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!name || !email || password.length < 8) {
    return res.status(400).json({ message: 'Debes indicar nombre, email y una contraseña de al menos 8 caracteres.' });
  }

  const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (exists.rowCount > 0) {
    return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'client')
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash]
  );

  const user = rows[0];
  const token = signUser(user);
  return res.status(201).json({ token, user });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Debes indicar email y contraseña.' });
  }

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];

  if (!user) {
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };

  return res.json({ token: signUser(safeUser), user: safeUser });
}));

app.get('/api/me', authRequired, asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [req.user.id]
  );

  if (!rows[0]) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  return res.json({ user: rows[0] });
}));

app.get('/api/rooms', asyncHandler(async (req, res) => {
  const checkInDate = parseDate(req.query.checkIn);
  const checkOutDate = parseDate(req.query.checkOut);

  if (checkInDate && checkOutDate) {
    if (!isValidRange(checkInDate, checkOutDate)) {
      return res.status(400).json({ message: 'Rango de fechas no válido.' });
    }

    const rooms = await getRoomAvailability(checkInDate, checkOutDate);
    return res.json({ rooms, filter: { checkInDate, checkOutDate } });
  }

  const { rows } = await pool.query(
    `SELECT r.*, h.name AS hotel_name, true AS available
     FROM rooms r
     JOIN hotels h ON h.id = r.hotel_id
     WHERE r.is_active = true
     ORDER BY h.name, r.number ASC`
  );
  return res.json({ rooms: rows });
}));

app.get('/api/availability', asyncHandler(async (req, res) => {
  const checkInDate = parseDate(req.query.checkIn);
  const checkOutDate = parseDate(req.query.checkOut);

  if (!checkInDate || !checkOutDate || !isValidRange(checkInDate, checkOutDate)) {
    return res.status(400).json({ message: 'Debes indicar fechas válidas de entrada y salida.' });
  }

  const rooms = await getRoomAvailability(checkInDate, checkOutDate);
  return res.json({ rooms, checkInDate, checkOutDate });
}));

app.post('/api/reservations', authRequired, asyncHandler(async (req, res) => {
  const roomId = Number(req.body.roomId);
  const checkInDate = parseDate(req.body.checkInDate);
  const checkOutDate = parseDate(req.body.checkOutDate);
  const guests = Number(req.body.guests);
  const guestName = String(req.body.guestName || '').trim();
  const guestLastname = String(req.body.guestLastname || '').trim();
  const notes = String(req.body.notes || '').trim();

  if (!roomId || !checkInDate || !checkOutDate || !isValidRange(checkInDate, checkOutDate) || !guests || !guestName || !guestLastname) {
    return res.status(400).json({ message: 'Debes completar todos los campos requeridos: habitación, fechas, huéspedes, nombre y apellido.' });
  }

  const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1 AND is_active = true', [roomId]);
  const room = roomResult.rows[0];
  if (!room) {
    return res.status(404).json({ message: 'La habitación no existe.' });
  }

  if (guests > room.capacity) {
    return res.status(400).json({ message: 'El número de huéspedes supera la capacidad de la habitación.' });
  }

  const conflictResult = await pool.query(
    `SELECT 1
     FROM reservations
     WHERE room_id = $1
       AND status <> 'cancelled'
       AND check_in_date < $3::date
       AND check_out_date > $2::date
     LIMIT 1`,
    [roomId, checkInDate, checkOutDate]
  );

  if (conflictResult.rowCount > 0) {
    return res.status(409).json({ message: 'La habitación no está disponible en esas fechas.' });
  }

  const nights = Math.max(1, Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / 86400000));
  const totalPrice = Number(room.price_per_night) * nights;

  const { rows } = await pool.query(
    `INSERT INTO reservations (user_id, room_id, guest_name, guest_lastname, check_in_date, check_out_date, guests, notes, total_price)
     VALUES ($1, $2, $3, $4, $5::date, $6::date, $7, $8, $9)
     RETURNING *`,
    [req.user.id, roomId, guestName, guestLastname, checkInDate, checkOutDate, guests, notes, totalPrice.toFixed(2)]
  );

  const reservation = rows[0];
  const detailed = await pool.query(
    `SELECT res.*, r.number, r.type, r.capacity, r.price_per_night, h.name AS hotel_name, u.name AS user_name, u.email AS user_email
     FROM reservations res
     JOIN rooms r ON r.id = res.room_id
     JOIN hotels h ON h.id = r.hotel_id
     JOIN users u ON u.id = res.user_id
     WHERE res.id = $1`,
    [reservation.id]
  );

  return res.status(201).json({ reservation: detailed.rows[0] });
}));

app.get('/api/reservations', authRequired, asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const query = isAdmin
    ? `SELECT res.*, r.number, r.type, r.capacity, r.price_per_night, h.name AS hotel_name, u.name AS user_name, u.email AS user_email
       FROM reservations res
       JOIN rooms r ON r.id = res.room_id
       JOIN hotels h ON h.id = r.hotel_id
       JOIN users u ON u.id = res.user_id
       ORDER BY res.created_at DESC`
    : `SELECT res.*, r.number, r.type, r.capacity, r.price_per_night, h.name AS hotel_name
       FROM reservations res
       JOIN rooms r ON r.id = res.room_id
       JOIN hotels h ON h.id = r.hotel_id
       WHERE res.user_id = $1
       ORDER BY res.created_at DESC`;

  const { rows } = await pool.query(query, isAdmin ? [] : [req.user.id]);
  return res.json({ reservations: rows });
}));

app.patch('/api/reservations/:id', authRequired, asyncHandler(async (req, res) => {
  const reservationId = Number(req.params.id);
  const roomId = Number(req.body.roomId);
  const checkInDate = parseDate(req.body.checkInDate);
  const checkOutDate = parseDate(req.body.checkOutDate);
  const guests = Number(req.body.guests);
  const guestName = String(req.body.guestName || '').trim();
  const guestLastname = String(req.body.guestLastname || '').trim();
  const notes = String(req.body.notes || '').trim();

  const currentResult = await pool.query('SELECT * FROM reservations WHERE id = $1', [reservationId]);
  const currentReservation = currentResult.rows[0];

  if (!currentReservation) {
    return res.status(404).json({ message: 'Reserva no encontrada.' });
  }

  if (req.user.role !== 'admin' && currentReservation.user_id !== req.user.id) {
    return res.status(403).json({ message: 'No puedes modificar esta reserva.' });
  }

  if (!roomId || !checkInDate || !checkOutDate || !isValidRange(checkInDate, checkOutDate) || !guests || !guestName || !guestLastname) {
    return res.status(400).json({ message: 'Debes completar todos los campos requeridos: habitación, fechas, huéspedes, nombre y apellido.' });
  }

  const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1 AND is_active = true', [roomId]);
  const room = roomResult.rows[0];
  if (!room) {
    return res.status(404).json({ message: 'La habitación no existe.' });
  }

  if (guests > room.capacity) {
    return res.status(400).json({ message: 'El número de huéspedes supera la capacidad de la habitación.' });
  }

  const conflictResult = await pool.query(
    `SELECT 1
     FROM reservations
     WHERE room_id = $1
       AND id <> $4
       AND status <> 'cancelled'
       AND check_in_date < $3::date
       AND check_out_date > $2::date
     LIMIT 1`,
    [roomId, checkInDate, checkOutDate, reservationId]
  );

  if (conflictResult.rowCount > 0) {
    return res.status(409).json({ message: 'La habitación no está disponible en esas fechas.' });
  }

  const nights = Math.max(1, Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / 86400000));
  const totalPrice = Number(room.price_per_night) * nights;

  const { rows } = await pool.query(
    `UPDATE reservations
     SET room_id = $1,
         guest_name = $2,
         guest_lastname = $3,
         check_in_date = $4::date,
         check_out_date = $5::date,
         guests = $6,
         notes = $7,
         total_price = $8,
         updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [roomId, guestName, guestLastname, checkInDate, checkOutDate, guests, notes, totalPrice.toFixed(2), reservationId]
  );

  const detailed = await pool.query(
    `SELECT res.*, r.number, r.type, r.capacity, r.price_per_night, h.name AS hotel_name
     FROM reservations res
     JOIN rooms r ON r.id = res.room_id
     JOIN hotels h ON h.id = r.hotel_id
     WHERE res.id = $1`,
    [rows[0].id]
  );

  return res.json({ reservation: detailed.rows[0] });
}));

app.delete('/api/reservations/:id', authRequired, asyncHandler(async (req, res) => {
  const reservationId = Number(req.params.id);

  const currentResult = await pool.query('SELECT * FROM reservations WHERE id = $1', [reservationId]);
  const currentReservation = currentResult.rows[0];

  if (!currentReservation) {
    return res.status(404).json({ message: 'Reserva no encontrada.' });
  }

  if (req.user.role !== 'admin' && currentReservation.user_id !== req.user.id) {
    return res.status(403).json({ message: 'No puedes cancelar esta reserva.' });
  }

  const { rows } = await pool.query(
    `UPDATE reservations
     SET status = 'cancelled', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [reservationId]
  );

  return res.json({ reservation: rows[0] });
}));

app.get('/api/admin/metrics', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const [users, rooms, reservations] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total FROM users'),
    pool.query('SELECT COUNT(*)::int AS total FROM rooms WHERE is_active = true'),
    pool.query("SELECT COUNT(*)::int AS total FROM reservations WHERE status = 'confirmed'"),
  ]);

  return res.json({
    users: users.rows[0].total,
    rooms: rooms.rows[0].total,
    reservations: reservations.rows[0].total,
  });
}));

app.get('/api/admin/users', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, created_at
     FROM users
     ORDER BY created_at DESC`
  );

  return res.json({ users: rows });
}));

app.get('/api/admin/rooms', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM rooms ORDER BY number ASC');
  return res.json({ rooms: rows });
}));

app.post('/api/admin/rooms', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const number = String(req.body.number || '').trim();
  const hotelId = Number(req.body.hotelId);
  const type = String(req.body.type || '').trim();
  const capacity = Number(req.body.capacity);
  const pricePerNight = Number(req.body.pricePerNight);
  const description = String(req.body.description || '').trim();

  if (!number || !hotelId || !type || !capacity || !pricePerNight) {
    return res.status(400).json({ message: 'Completa todos los campos de la habitación.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO rooms (hotel_id, number, type, capacity, price_per_night, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [hotelId, number, type, capacity, pricePerNight, description]
  );

  return res.status(201).json({ room: rows[0] });
}));

app.patch('/api/admin/rooms/:id', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const roomId = Number(req.params.id);
  const hotelId = Number(req.body.hotelId);
  const number = String(req.body.number || '').trim();
  const type = String(req.body.type || '').trim();
  const capacity = Number(req.body.capacity);
  const pricePerNight = Number(req.body.pricePerNight);
  const description = String(req.body.description || '').trim();
  const isActive = Boolean(req.body.isActive);

  const { rows } = await pool.query(
    `UPDATE rooms
     SET number = $1,
        hotel_id = $2,
         type = $2,
         capacity = $3,
         price_per_night = $4,
         description = $5,
         is_active = $6
     WHERE id = $7
     RETURNING *`,
    [number, hotelId, type, capacity, pricePerNight, description, isActive, roomId]
  );

  if (!rows[0]) {
    return res.status(404).json({ message: 'Habitación no encontrada.' });
  }

  return res.json({ room: rows[0] });
}));

app.delete('/api/admin/rooms/:id', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const roomId = Number(req.params.id);
  const { rows } = await pool.query('UPDATE rooms SET is_active = false WHERE id = $1 RETURNING *', [roomId]);

  if (!rows[0]) {
    return res.status(404).json({ message: 'Habitación no encontrada.' });
  }

  return res.json({ room: rows[0] });
}));

app.get('/api/admin/reservations', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT res.*, r.number, r.type, r.capacity, r.price_per_night, h.name AS hotel_name, u.name AS user_name, u.email AS user_email
     FROM reservations res
     JOIN rooms r ON r.id = res.room_id
     JOIN hotels h ON h.id = r.hotel_id
     JOIN users u ON u.id = res.user_id
     ORDER BY res.created_at DESC`
  );

  return res.json({ reservations: rows });
}));

app.patch('/api/admin/reservations/:id/status', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const reservationId = Number(req.params.id);
  const status = String(req.body.status || '').trim();

  if (!['confirmed', 'cancelled', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Estado no válido.' });
  }

  const { rows } = await pool.query(
    `UPDATE reservations
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, reservationId]
  );

  if (!rows[0]) {
    return res.status(404).json({ message: 'Reserva no encontrada.' });
  }

  return res.json({ reservation: rows[0] });
}));

app.use((error, req, res, next) => {
  console.error(error);
  return res.status(500).json({ message: 'Error interno del servidor.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

waitForDatabase()
  .then(() => initDb())
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor iniciado en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo inicializar la base de datos:', error);
    process.exit(1);
  });
