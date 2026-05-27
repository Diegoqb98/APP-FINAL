-- Datos de ejemplo para la aplicación.
-- El administrador inicial también se crea automáticamente al arrancar el backend.

INSERT INTO hotels (name, city, address, description)
VALUES
  ('Gran Hotel Madrid', 'Madrid', 'Paseo del Prado 123', 'Hotel de lujo en el centro de Madrid con vistas a museos.'),
  ('Hotel Barcelona Beachfront', 'Barcelona', 'Paseo Marítimo 456', 'Hotel frente al mar con acceso directo a la playa.'),
  ('Hotel Sevilla Clásico', 'Sevilla', 'Plaza de España 789', 'Hotel histórico con arquitectura tradicional andaluza.'),
  ('Hotel Valencia Moderno', 'Valencia', 'Calle Colón 321', 'Hotel moderno con piscina y spa completo.'),
  ('Hotel Bilbao Arts', 'Bilbao', 'Avenida del Guggenheim 654', 'Hotel boutique cerca del Museo Guggenheim.')
ON CONFLICT DO NOTHING;

INSERT INTO rooms (hotel_id, number, type, capacity, price_per_night, description)
VALUES
  (1, '101', 'Individual', 1, 65.00, 'Habitación individual con baño privado.'),
  (1, '102', 'Doble', 2, 89.00, 'Habitación doble con cama king size.'),
  (1, '201', 'Suite', 4, 150.00, 'Suite con zona de estar y vistas al Prado.'),
  (1, '202', 'Familiar', 4, 135.00, 'Habitación amplia para familias.'),
  (2, '101', 'Individual', 1, 75.00, 'Habitación con vistas al mar.'),
  (2, '102', 'Doble', 2, 99.00, 'Habitación doble frente a la playa.'),
  (2, '201', 'Suite', 4, 180.00, 'Suite premium con balcón al mar.'),
  (3, '101', 'Individual', 1, 55.00, 'Habitación con estilo tradicional.'),
  (3, '102', 'Doble', 2, 79.00, 'Habitación doble con decoración andaluza.'),
  (3, '201', 'Suite', 4, 140.00, 'Suite con patio interior.'),
  (4, '101', 'Individual', 1, 70.00, 'Habitación moderna con tecnología smart.'),
  (4, '102', 'Doble', 2, 95.00, 'Habitación doble con acceso a spa.'),
  (4, '201', 'Suite', 4, 160.00, 'Suite deluxe con piscina privada.'),
  (5, '101', 'Individual', 1, 80.00, 'Habitación art deco cerca del Guggenheim.'),
  (5, '102', 'Doble', 2, 110.00, 'Habitación doble design.'),
  (5, '201', 'Suite', 4, 170.00, 'Suite artística con galería privada.')
ON CONFLICT DO NOTHING;
