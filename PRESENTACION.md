# 🏨 GESTIÓN DE RESERVAS HOTELERAS - Presentación para el Profesor

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Características Implementadas](#características-implementadas)
3. [Arquitectura Técnica](#arquitectura-técnica)
4. [Cómo Usar la Aplicación](#cómo-usar-la-aplicación)
5. [Credenciales de Prueba](#credenciales-de-prueba)
6. [Funcionalidades Detalladas](#funcionalidades-detalladas)

---

## 📱 Descripción General

Sistema web completo de gestión de reservas hoteleras con:
- **5 Hoteles** diferentes en distintas ciudades
- **Múltiples habitaciones** por hotel con capacidades variables
- **Registro de huéspedes** con nombre y apellido en cada reserva
- **Panel administrativo** con gestión completa
- **Autenticación JWT** con roles (cliente/administrador)
- **Interfaz responsiva** con tema profesional claro

**Acceso:** http://localhost:3001

---

## ✨ Características Implementadas

### 👥 Sistema de Usuarios
- ✅ Registro de nuevos clientes
- ✅ Inicio de sesión con email/contraseña
- ✅ Autenticación JWT (validez: 7 días)
- ✅ Dos roles: **Cliente** y **Administrador**
- ✅ Datos cifrados con bcrypt (10 rondas)

### 🏨 Gestión de Hoteles (NUEVO)
- ✅ **5 hoteles** pre-cargados:
  1. Gran Hotel Madrid (Paseo del Prado)
  2. Hotel Barcelona Beachfront (Paseo Marítimo)
  3. Hotel Sevilla Clásico (Plaza de España)
  4. Hotel Valencia Moderno (Calle Colón)
  5. Hotel Bilbao Arts (Avenida Guggenheim)

### 🛏️ Gestión de Habitaciones
- ✅ Crear, editar, activar/desactivar habitaciones
- ✅ **Tipos:** Individual, Doble, Suite, Familiar
- ✅ Asignación automática a hoteles
- ✅ Precios variables por noche (55€ - 180€)
- ✅ Descripción detallada de cada habitación

### 📅 Reservas (MEJORADO)
- ✅ Crear reservas con **nombre y apellido** del huésped
- ✅ Editar reservas existentes (nombre, apellido, fechas, etc.)
- ✅ Cancelar reservas
- ✅ Control de conflictos de fechas
- ✅ Cálculo automático del total (precio × noches)
- ✅ Estados: Confirmada, Pendiente, Cancelada
- ✅ Notas especiales en reservas (hora de llegada, solicitudes)

### 📊 Panel de Administración
- ✅ **Gestión de Habitaciones:** Create, Read, Update, Delete
- ✅ **Listado de Usuarios:** Ver todos los clientes registrados
- ✅ **Control de Reservas:** 
  - Ver todas las reservas (de todos los usuarios)
  - Cambiar estado de reservas
  - Ver detalles completos del huésped
  - Información del hotel y habitación

### 🎨 Interfaz de Usuario
- ✅ Tema profesional claro y moderno
- ✅ Diseño responsivo (mobile-first)
- ✅ Componentes visuales mejorados:
  - Tarjetas de huéspedes con información resumida
  - Tarjetas de reservas con detalles completos
  - Badges de rol y estado
  - Indicadores visuales de disponibilidad

---

## 🏗️ Arquitectura Técnica

### Tecnologías Utilizadas
```
Frontend:         HTML5, CSS3, JavaScript ES6+
Backend:          Node.js + Express.js
Base de Datos:    PostgreSQL 16
Contenedorización: Docker + Docker Compose
Autenticación:    JWT (jsonwebtoken)
Contraseñas:      bcryptjs
Acceso BD:        pg (PostgreSQL client)
```

### Estructura de Base de Datos

#### Tabla: `hotels`
```sql
- id (PK)
- name VARCHAR(120)
- city VARCHAR(100)
- address TEXT
- description TEXT
- is_active BOOLEAN
- created_at TIMESTAMP
```

#### Tabla: `users`
```sql
- id (PK)
- name VARCHAR(120)
- email VARCHAR(180) UNIQUE
- password_hash TEXT
- role VARCHAR(20) {client|admin}
- created_at TIMESTAMP
```

#### Tabla: `rooms`
```sql
- id (PK)
- hotel_id (FK → hotels)
- number VARCHAR(20)
- type VARCHAR(60)
- capacity INTEGER
- price_per_night NUMERIC(10,2)
- description TEXT
- is_active BOOLEAN
- created_at TIMESTAMP
- UNIQUE: (hotel_id, number)
```

#### Tabla: `reservations`
```sql
- id (PK)
- user_id (FK → users)
- room_id (FK → rooms)
- guest_name VARCHAR(60)          ← NUEVO
- guest_lastname VARCHAR(60)      ← NUEVO
- check_in_date DATE
- check_out_date DATE
- guests INTEGER
- notes TEXT
- status VARCHAR(20) {confirmed|pending|cancelled}
- total_price NUMERIC(10,2)
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

### Endpoints API

#### Autenticación
- `POST /api/auth/register` - Crear cuenta de cliente
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/me` - Información del usuario actual (requiere auth)

#### Hoteles
- `GET /api/hotels` - Listar todos los hoteles activos ✨ NUEVO

#### Habitaciones
- `GET /api/rooms` - Listar habitaciones (opcionalmente filtrar por fechas)
- `GET /api/availability` - Disponibilidad en rango de fechas

#### Reservas
- `POST /api/reservations` - Crear nueva reserva
- `GET /api/reservations` - Mis reservas (cliente) o todas (admin)
- `PATCH /api/reservations/:id` - Actualizar reserva
- `DELETE /api/reservations/:id` - Cancelar reserva

#### Admin
- `GET /api/admin/users` - Listar todos los usuarios
- `GET /api/admin/rooms` - Listar todas las habitaciones
- `GET /api/admin/reservations` - Listar todas las reservas
- `PATCH /api/admin/rooms/:id` - Editar habitación
- `PATCH /api/admin/reservations/:id/status` - Cambiar estado

#### Estadísticas
- `GET /api/health` - Check de salud del servicio
- `GET /api/stats` - Estadísticas públicas (usuarios, habitaciones, reservas)

---

## 🚀 Cómo Usar la Aplicación

### 1️⃣ Iniciar la Aplicación

```bash
cd "APP-FINAL"
docker-compose up -d
```

La aplicación estará disponible en: **http://localhost:3001**

### 2️⃣ Crear una Cuenta (Registro)

1. Accede a http://localhost:3001
2. Haz clic en **"Registrarse"**
3. Completa:
   - **Nombre:** Tu nombre completo
   - **Email:** Tu correo
   - **Contraseña:** Mínimo 8 caracteres
4. Haz clic en **"Crear cuenta"**

### 3️⃣ Hacer una Reserva (Cliente)

1. **Buscar disponibilidad:**
   - Selecciona fechas de entrada y salida
   - Haz clic en **"Buscar"**
   - Ve las habitaciones disponibles

2. **Crear reserva:**
   - Selecciona un **Hotel** de la lista
   - Se cargarán las habitaciones de ese hotel
   - Selecciona una **Habitación**
   - Ingresa tu **Nombre** (como huésped)
   - Ingresa tu **Apellido** (como huésped)
   - Selecciona **fechas** y **cantidad de huéspedes**
   - (Opcional) Añade **observaciones** (hora de llegada, solicitudes especiales)
   - Haz clic en **"Reservar"**

3. **Gestionar reservas:**
   - Ve tus reservas en la sección **"Mis reservas"**
   - Haz clic en **"Editar"** para cambiar detalles
   - Haz clic en **"Cancelar"** para anular la reserva

### 4️⃣ Acceder al Panel Admin

1. Inicia sesión con credenciales de administrador
2. Se abrirá automáticamente el **panel de Administración**

---

## 🔐 Credenciales de Prueba

### Admin (Administrador)
```
Email:    admin@didac.qb.local
Password: 1234
```

### Cliente (Usuario Regular)
```
Email:    didac.qb@gmail.com
Password: 1234
```

### Admin Alternativo
```
Email:    admin@hotel.local
Password: Admin123!
```

---

## 📊 Funcionalidades Detalladas

### 👨‍💼 Panel de Administración

#### 1. Gestión de Habitaciones
**Crear:**
- Número, tipo, capacidad, precio, descripción
- Se asigna automáticamente al hotel correcto

**Editar:**
- Cambiar cualquier detalle
- Activar/desactivar

**Eliminar (Desactivar):**
- Las habitaciones inactivas no aparecen en búsquedas

#### 2. Listado de Usuarios
Muestra:
- 👤 Nombre del usuario
- 🏨 Badge de rol (Huésped o Administrador)
- 📧 Email
- 📅 Cantidad de reservas (total y activas)
- ✓ Indicador de estado (verde si tiene reservas)

#### 3. Gestión de Reservas
Ve todas las reservas con:
- 🏨 **Hotel** donde está la habitación
- 👤 **Nombre del usuario** que hizo la reserva
- 👥 **Nombre y apellido del huésped** en la reserva (NUEVO)
- 📧 Email del usuario
- 🏠 Tipo de habitación
- 📅 Fechas (entrada → salida con cantidad de noches)
- 👥 Número de huéspedes
- 📝 Notas especiales
- 💰 Precio total
- **Cambiar estado:** Dropdown para Confirmada, Pendiente, Cancelada

---

## 📁 Estructura del Proyecto

```
APP-FINAL/
├── public/
│   ├── app.js                    (Lógica frontend)
│   ├── index.html                (Estructura HTML)
│   ├── styles.css                (Estilos - tema claro)
│   └── ...
├── sql/
│   ├── schema.sql                (Estructura BD - ACTUALIZADO)
│   └── seed.sql                  (Datos iniciales - ACTUALIZADO)
├── src/
│   └── db.js                     (Pool de conexión PostgreSQL)
├── Dockerfile                    (Configuración Node.js)
├── docker-compose.yml            (Orquestación de servicios)
├── server.js                     (API Express - ACTUALIZADO)
├── package.json                  (Dependencias)
├── README.md                     (Documentación técnica)
└── PRESENTACION.md              (Este archivo)
```

---

## 🔄 Flujo de Datos

```
Cliente (Frontend)
    ↓
[HTTP Request con JWT]
    ↓
Express Server (server.js)
    ↓
[Validación JWT + Lógica Negocio]
    ↓
PostgreSQL Database
    ↓
[Respuesta JSON]
    ↓
Cliente (Actualizar UI)
```

---

## ✅ Verificación Rápida

### Comprobar que todo funciona:

1. **Base de Datos:**
   ```bash
   docker exec hotel-db psql -U postgres -d hotel_app -c "SELECT COUNT(*) FROM hotels;"
   # Debería mostrar: 5
   ```

2. **API Salud:**
   ```bash
   curl http://localhost:3001/api/health
   # Debería responder: {"ok":true,"service":"hotel-reservations-api"}
   ```

3. **Hoteles:**
   ```bash
   curl http://localhost:3001/api/hotels
   # Debería listar los 5 hoteles
   ```

4. **Estadísticas:**
   ```bash
   curl http://localhost:3001/api/stats
   # Debería mostrar conteos de usuarios, habitaciones, reservas
   ```

---

## 🎯 Puntos Clave para la Presentación

### ✨ Mejoras Implementadas:
1. ✅ **Múltiples Hoteles** - 5 ciudades españolas diferentes
2. ✅ **Datos del Huésped** - Nombre y apellido en cada reserva
3. ✅ **Panel Admin Mejorado** - Información completa del huésped
4. ✅ **Tema Profesional** - Interfaz moderna y clara
5. ✅ **API Escalable** - Estructura preparada para futuras mejoras

### 🚀 Tecnologías Utilizadas:
- Node.js + Express (Backend moderno)
- PostgreSQL (BD relacional robusta)
- Docker (Containerización)
- JWT (Seguridad)
- HTML/CSS/JS (Frontend responsivo)

### 💾 Base de Datos:
- Relaciones correctas con FK
- Integridad referencial
- Índices en campos clave
- Auto-inicialización con datos de prueba

### 🔒 Seguridad:
- Contraseñas hasheadas con bcrypt
- JWT para autenticación
- Validación en servidor
- SQL preparadas para evitar inyecciones

---

## 📞 Soporte Rápido

### Reiniciar la aplicación:
```bash
docker-compose restart
```

### Ver logs:
```bash
docker-compose logs -f app
```

### Parar todo:
```bash
docker-compose down
```

### Limpiar datos (reiniciar BD):
```bash
docker-compose down -v
docker-compose up -d
```

---

**Profesor, la aplicación está lista para demostración.**
**Puedes probar con las credenciales proporcionadas anteriormente.**

