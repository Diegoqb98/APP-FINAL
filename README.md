# Gestión de Reservas Hoteleras

![Aplicación Web DAW](https://img.shields.io/badge/Aplicación%20Web-DAW-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/Node.js-v20+-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16+-336791)

## Portada

**Título:** Desarrollo de una Aplicación Web para la Gestión de Reservas Hoteleras

**Autor:** Diego Quiroga Bausa

**Curso:** Desarrollo de Aplicaciones Web (DAW)

**Fecha:** 20/04/2026

**User Testing:** Sebastia Romaguera

---

## Índice

1. [Introducción](#introducción)
2. [Alcance del Proyecto](#alcance-del-proyecto)
3. [Funcionalidades](#funcionalidades)
4. [Requisitos](#requisitos)
5. [Instalación](#instalación)
6. [Uso](#uso)
7. [Arquitectura Técnica](#arquitectura-técnica)
8. [Estructura del Proyecto](#estructura-del-proyecto)
9. [API REST](#api-rest)
10. [Credenciales por Defecto](#credenciales-por-defecto)
11. [Limitaciones](#limitaciones)
12. [Notas de Desarrollo](#notas-de-desarrollo)

---

## Introducción

En el contexto actual de digitalización del sector turístico, la gestión eficiente de reservas hoteleras se ha convertido en un elemento clave para garantizar tanto la optimización de recursos como la satisfacción del cliente. Los sistemas tradicionales o poco integrados suelen presentar limitaciones significativas, como la falta de actualización en tiempo real, la duplicidad de reservas o la dificultad en la gestión centralizada de la información.

El presente proyecto tiene como finalidad el desarrollo de una aplicación web orientada a la gestión de reservas de hoteles, proporcionando una solución digital que permita automatizar y optimizar los procesos relacionados con la disponibilidad, reserva y administración de habitaciones.

La aplicación permitirá a los usuarios consultar en tiempo real la disponibilidad de habitaciones, realizar reservas de manera ágil y gestionar sus estancias, mientras que los administradores dispondrán de herramientas específicas para la gestión integral del sistema, incluyendo el control de usuarios, habitaciones y reservas.

De este modo, el sistema propuesto busca mejorar la eficiencia operativa, reducir errores humanos derivados de procesos manuales y ofrecer una experiencia de usuario intuitiva y accesible desde cualquier dispositivo con conexión a internet.

---

## Alcance del Proyecto

El alcance de este proyecto se centra en el diseño y desarrollo de una aplicación web funcional que cubra los procesos esenciales de gestión de reservas en un entorno hotelero. La solución estará orientada a un modelo de hotel individual y no contemplará, en esta fase, la gestión de múltiples establecimientos ni la integración con plataformas externas de terceros.

### Usuarios del Sistema

Se contemplan dos tipos de usuarios dentro del sistema:

- **Usuarios cliente:** Podrán registrarse, iniciar sesión, consultar disponibilidad y gestionar sus reservas.
- **Usuarios administradores:** Tendrán acceso a funcionalidades avanzadas de gestión y control del sistema.

### Limitaciones del Sistema

Con el fin de acotar el alcance y garantizar la viabilidad del proyecto dentro del tiempo disponible, se establecen las siguientes limitaciones:

- No se integrarán pasarelas de pago reales; en caso de implementarse, será mediante simulación.
- No se contemplará la integración con plataformas externas de reservas (como Booking o Expedia).
- El sistema estará diseñado para la gestión de un único hotel.

---

## Funcionalidades

### Para Usuarios Clientes

✅ **Registro e inicio de sesión** con validación de datos  
✅ **Consulta de disponibilidad** de habitaciones en tiempo real por fechas  
✅ **Creación de reservas** con cálculo automático de precio  
✅ **Gestión de reservas** (edición y cancelación)  
✅ **Visualización de historial** de reservas personales  
✅ **Interfaz responsive** accesible desde dispositivos móviles  

### Para Administradores

✅ **Panel de administración** con acceso restringido  
✅ **Gestión de habitaciones** (crear, editar, desactivar)  
✅ **Gestión de usuarios** (visualización y control)  
✅ **Gestión centralizada de reservas** (edición y cambio de estado)  
✅ **Estadísticas del sistema** (usuarios, habitaciones, reservas totales)  
✅ **Control de disponibilidad** por fechas

### Características Técnicas

✅ **API REST** con autenticación JWT  
✅ **Base de datos relacional** PostgreSQL  
✅ **Autenticación segura** con bcrypt  
✅ **Validación de datos** en cliente y servidor  
✅ **Control de conflictos** de fechas para evitar dobles reservas  
✅ **Inicialización automática** de base de datos y datos de ejemplo  

---

## Requisitos

### Opción 1: Instalación Local
- Node.js 18 o superior
- PostgreSQL 14 o superior
- npm o yarn

### Opción 2: Con Docker (Recomendado)
- Docker Desktop
- Docker Compose

---

## Instalación

### Instalación Rápida con Docker (Recomendado)

```bash
cd "APP-FINAL"
docker compose up --build
```

Luego abre `http://localhost:3000` en tu navegador.

### Instalación Local

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd APP-FINAL
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus valores:
   ```env
   PORT=3000
   DATABASE_URL=postgres://usuario:contraseña@localhost:5432/hotel_reservations
   JWT_SECRET=tu-secreto-jwt-aqui
   PGSSLMODE=disable
   ```

4. **Crear base de datos PostgreSQL:**
   ```bash
   createdb hotel_reservations
   ```

5. **Iniciar la aplicación:**
   ```bash
   npm start
   ```

6. **Acceder a la aplicación:**
   Abre `http://localhost:3000` en tu navegador.

### Arranque Rápido en Windows

Si tienes Node.js instalado, simplemente ejecuta:
```bash
start.bat
```

### Arranque Rápido (script recomendado)

Para iniciar la aplicación exactamente como lo hicimos (levantar Docker Desktop si hace falta y arrancar solo el servicio `app`) hay scripts incluidos en `scripts/`:

- `scripts\start_fast.bat` — Windows batch (doble clic) que intenta abrir Docker Desktop y luego ejecuta `docker compose up -d --build app`.
- `scripts\start_fast.ps1` — PowerShell equivalente (ejecuta con `PowerShell -ExecutionPolicy Bypass -File .\scripts\start_fast.ps1`).

Estos scripts ayudan a arrancar la app más rápido porque solo reconstruyen e inician el servicio `app` en lugar de toda la stack.

### Crear acceso en el Inicio de Windows

Si quieres que la app arranque automáticamente al iniciar sesión (por usuario), ejecuta:

```powershell
PowerShell -ExecutionPolicy Bypass -File .\scripts\create-startup-shortcut.ps1
```

Esto crea un acceso directo en la carpeta Startup del usuario para lanzar `start_fast.bat`.


---

## Uso

### Para Usuarios Clientes

1. **Registrarse:**
   - Dirígete a la sección "Registro de cliente"
   - Completa nombre, email y contraseña (mínimo 8 caracteres)
   - Haz clic en "Crear cuenta"

2. **Iniciar Sesión:**
   - Usa tus credenciales en la sección "Iniciar sesión"

3. **Consultar Disponibilidad:**
   - Selecciona fechas de entrada y salida
   - El sistema mostrará automáticamente las habitaciones disponibles

4. **Hacer una Reserva:**
   - Selecciona una habitación
   - Elige fechas de entrada y salida
   - Indica el número de huéspedes
   - Añade observaciones si es necesario
   - Haz clic en "Reservar"

5. **Gestionar Reservas:**
   - Visualiza todas tus reservas en "Mis reservas"
   - Puedes editar o cancelar cualquier reserva

### Para Administradores

1. **Iniciar Sesión:**
   - Email: `admin@hotel.local`
   - Contraseña: `Admin123!` (ver [Credenciales por Defecto](#credenciales-por-defecto))

2. **Gestionar Habitaciones:**
   - Visualiza todas las habitaciones del hotel
   - Crea nuevas habitaciones (número, tipo, capacidad, precio)
   - Edita información existente
   - Desactiva habitaciones cuando sea necesario

3. **Gestionar Usuarios:**
   - Visualiza todos los usuarios registrados
   - Consulta información personal de cada usuario

4. **Gestionar Reservas:**
   - Accede a todas las reservas del hotel
   - Visualiza detalles completos de cada reserva
   - Cambia el estado de reservas (confirmada, pendiente, cancelada)

5. **Ver Estadísticas:**
   - Total de usuarios
   - Total de habitaciones activas
   - Total de reservas confirmadas

---

## Arquitectura Técnica

### Stack Tecnológico

```
Frontend:
├── HTML5
├── CSS3 (Responsive Design)
└── JavaScript Vanilla (ES6+)

Backend:
├── Node.js (v20-alpine)
├── Express.js
├── JWT (JSON Web Tokens)
└── bcryptjs (Hashing de contraseñas)

Base de Datos:
├── PostgreSQL 16
└── Pool de conexiones

DevOps:
├── Docker
├── Docker Compose
└── Dockerfile (Node.js Alpine)
```

### Diagrama de Arquitectura

```
┌─────────────────┐
│   Cliente Web   │
│ (HTML/CSS/JS)   │
└────────┬────────┘
         │ HTTP/HTTPS
         ▼
┌─────────────────────────┐
│    Express Server       │
│  (Node.js - Puerto 3000)│
├─────────────────────────┤
│ • Rutas API REST        │
│ • Autenticación JWT     │
│ • Validación de datos   │
│ • Control de reservas   │
└────────┬────────────────┘
         │ SQL
         ▼
┌─────────────────────────┐
│  PostgreSQL Database    │
│  (Puerto 5432)          │
├─────────────────────────┤
│ • Usuarios              │
│ • Habitaciones          │
│ • Reservas              │
└─────────────────────────┘
```

### Flujo de Autenticación

```
Cliente                    Servidor
   │                          │
   ├─ POST /api/auth/login ──→│
   │  (email, password)       │
   │                          │ Verificar credenciales
   │                          │ Generar JWT
   │←─ Token JWT ─────────────┤
   │                          │
   ├─ GET /api/me ──────────→│
   │  (Authorization: Bearer)  │
   │                          │ Validar token
   │←─ Datos usuario ─────────┤
```

---

## Estructura del Proyecto

```
APP-FINAL/
├── server.js                    # Servidor Express principal
├── package.json                 # Dependencias del proyecto
├── package-lock.json            # Lock file
├── .env.example                 # Plantilla de variables de entorno
├── .dockerignore                # Archivos excluidos de Docker
├── Dockerfile                   # Imagen Docker de la app
├── docker-compose.yml           # Orquestación Docker (app + BD)
├── start.bat                    # Script de inicio rápido Windows
│
├── src/
│   └── db.js                    # Configuración conexión PostgreSQL
│
├── public/
│   ├── index.html               # Página principal
│   ├── app.js                   # Lógica frontend (JavaScript)
│   └── styles.css               # Estilos CSS
│
├── sql/
│   ├── schema.sql               # Esquema de base de datos
│   └── seed.sql                 # Datos de ejemplo
│
└── README.md                    # Este archivo
```

### Descripción de Archivos Principales

| Archivo | Descripción |
|---------|-------------|
| `server.js` | Servidor Express con todas las rutas de la API, lógica de autenticación y gestión de reservas |
| `src/db.js` | Pool de conexiones a PostgreSQL usando pg |
| `public/app.js` | Toda la lógica del frontend, manejo de eventos y peticiones a la API |
| `public/index.html` | Estructura HTML con formularios y secciones de la aplicación |
| `public/styles.css` | Diseño responsive de la interfaz |
| `sql/schema.sql` | Esquema de tablas (usuarios, habitaciones, reservas) |

---

## API REST

### Endpoints de Autenticación

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan García",
  "email": "juan@example.com",
  "password": "Password123"
}

Response: { token: "jwt...", user: {...} }
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@hotel.local",
  "password": "Admin123!"
}

Response: { token: "jwt...", user: {...} }
```

### Endpoints de Habitaciones

```http
GET /api/rooms
Response: { rooms: [...] }

GET /api/availability?checkIn=2026-05-25&checkOut=2026-05-28
Response: { rooms: [...], checkInDate: "2026-05-25", checkOutDate: "2026-05-28" }

POST /api/admin/rooms (Admin)
Authorization: Bearer <token>
{ number, type, capacity, pricePerNight, description }

PATCH /api/admin/rooms/:id (Admin)
PATCH /api/admin/rooms/:id (Admin) - Desactivar

DELETE /api/admin/rooms/:id (Admin)
```

### Endpoints de Reservas

```http
POST /api/reservations (Cliente autenticado)
{ roomId, checkInDate, checkOutDate, guests, notes }

GET /api/reservations (Autenticado)
Response: { reservations: [...] }

PATCH /api/reservations/:id (Dueño o Admin)
{ roomId, checkInDate, checkOutDate, guests, notes }

DELETE /api/reservations/:id (Dueño o Admin)
PATCH /api/admin/reservations/:id/status (Admin)
{ status: "confirmed|pending|cancelled" }
```

### Endpoints de Administración

```http
GET /api/stats
Response: { users: 1, rooms: 4, reservations: 1 }

GET /api/admin/users (Admin)
GET /api/admin/rooms (Admin)
GET /api/admin/reservations (Admin)
GET /api/admin/metrics (Admin)
```

### Endpoint de Salud

```http
GET /api/health
Response: { ok: true, service: "hotel-reservations-api" }
```

---

## Credenciales por Defecto

### Administrador

| Campo | Valor |
|-------|-------|
| Email | `admin@hotel.local` |
| Contraseña | `Admin123!` |

**Nota:** Las credenciales se crean automáticamente en el primer inicio si no existe ningún administrador.

### Habitaciones de Ejemplo

| Número | Tipo | Capacidad | Precio/Noche | Estado |
|--------|------|-----------|--------------|--------|
| 101 | Individual | 1 | 65,00 € | Activa |
| 102 | Doble | 2 | 89,00 € | Activa |
| 201 | Suite | 4 | 150,00 € | Activa |
| 202 | Familiar | 4 | 135,00 € | Activa |

---

## Limitaciones

### Funcionalidades No Implementadas (Por Diseño)

- ❌ Pasarelas de pago reales (sin integración con Stripe, PayPal, etc.)
- ❌ Integración con plataformas externas (Booking, Expedia, etc.)
- ❌ Gestión de múltiples hoteles
- ❌ Sistema de facturación avanzado
- ❌ Notificaciones por email automáticas
- ❌ Búsqueda filtrada avanzada

### Capacidades Actuales

- ✅ Máximo 1 hotel por instancia
- ✅ Usuarios de dos tipos: cliente y administrador
- ✅ Hasta 255 habitaciones por hotel (limitación teórica)
- ✅ Reservas ilimitadas con control de conflictos

---

## Notas de Desarrollo

### Características Especiales

1. **Inicialización Automática:**
   - Base de datos se crea automáticamente al iniciar
   - Tablas se generan si no existen
   - Datos de ejemplo se cargan en primera ejecución
   - Usuario administrador se crea automáticamente

2. **Validación de Datos:**
   - Validación en cliente (JavaScript)
   - Validación en servidor (Express middleware)
   - Control de conflictos de fechas
   - Verificación de capacidad de habitaciones

3. **Seguridad:**
   - Contraseñas hasheadas con bcryptjs
   - Tokens JWT con expiración (7 días)
   - Validación de autorización en endpoints
   - Protección contra inyección SQL (parametrización)

4. **Rendimiento:**
   - Pool de conexiones PostgreSQL
   - Queries optimizadas con índices
   - Paginación implícita en listas

### Variables de Entorno

```env
PORT=3000                                              # Puerto de ejecución
DATABASE_URL=postgres://postgres:password@localhost:5432/hotel_reservations
JWT_SECRET=development-secret                          # Cambiar en producción
PGSSLMODE=disable                                      # disable para desarrollo
```

### Comandos Útiles

```bash
# Instalación
npm install

# Desarrollo
npm start

# Docker
docker compose up --build
docker compose down

# Base de datos (local)
psql -U postgres -d hotel_reservations
SELECT * FROM users;
SELECT * FROM rooms;
SELECT * FROM reservations;
```

### Testing Manual

```bash
# Verificar salud de la API
curl http://localhost:3000/api/health

# Obtener estadísticas
curl http://localhost:3000/api/stats

# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Password123"}'
```

---

## Información de Testing

**User Testing realizado por:** Sebastia Romaguera

El sistema ha sido probado extensamente para validar:
- Usabilidad de la interfaz
- Funcionalidad de reservas
- Gestión administrativa
- Compatibilidad en diferentes dispositivos
- Manejo de errores y casos límite

---

## Licencia

Este proyecto fue desarrollado como parte del curso Desarrollo de Aplicaciones Web (DAW).

---

## Contacto

**Autor:** Diego Quiroga Bausa  
**Email:** diego.quiroga@estudiante.edu  
**Curso:** DAW  
**Año:** 2026

---

**Última actualización:** 19 de mayo de 2026
