const state = {
  token: localStorage.getItem('hotel-token'),
  user: null,
  hotels: [],
  rooms: [],
  reservations: [],
  admin: {
    metrics: null,
    rooms: [],
    users: [],
    reservations: [],
  },
  editingReservationId: null,
  editingRoomId: null,
  selectedHotelId: null,
};

const authPanel = document.getElementById('auth-panel');
const appPanel = document.getElementById('app-panel');
const adminPanel = document.getElementById('admin-panel');
const welcomeText = document.getElementById('welcome-text');
const statUsers = document.getElementById('stat-users');
const statRooms = document.getElementById('stat-rooms');
const statReservations = document.getElementById('stat-reservations');
const reservationCount = document.getElementById('reservation-count');
const availabilityResults = document.getElementById('availability-results');
const roomSelect = document.getElementById('room-select');
const hotelSelect = document.getElementById('hotel-select');
const adminHotelSelect = document.getElementById('admin-hotel-select');
const myReservations = document.getElementById('my-reservations');
const roomsAdminList = document.getElementById('rooms-admin-list');
const usersAdminList = document.getElementById('users-admin-list');
const adminReservationsList = document.getElementById('admin-reservations-list');
const adminReservationsListFull = document.getElementById('admin-reservations-list-full');
const reservationTemplate = document.getElementById('reservation-template');
const homePage = document.getElementById('home-page');
const availabilityPage = document.getElementById('availability-page');
const bookPage = document.getElementById('book-page');
const reservationsPage = document.getElementById('reservations-page');
const navHome = document.getElementById('nav-home');
const navAvailability = document.getElementById('nav-availability');
const navBook = document.getElementById('nav-book');
const navReservations = document.getElementById('nav-reservations');
const navAdmin = document.getElementById('nav-admin');
const adminRoomsPage = document.getElementById('admin-rooms-page');
const adminReservationsPage = document.getElementById('admin-reservations-page');
const adminUsersPage = document.getElementById('admin-users-page');
const adminReservationDetail = document.getElementById('admin-reservation-detail');
const adminReservationDetailCard = document.getElementById('admin-reservation-detail-card');
const adminBackToList = document.getElementById('admin-back-to-list');
const navAdminRooms = document.getElementById('nav-admin-rooms');
const navAdminReservations = document.getElementById('nav-admin-reservations');
const navAdminUsers = document.getElementById('nav-admin-users');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const availabilityForm = document.getElementById('availability-form');
const reservationForm = document.getElementById('reservation-form');
const roomForm = document.getElementById('room-form');
const logoutButton = document.getElementById('logout-button');
const refreshButton = document.getElementById('refresh-button');

function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  return fetch(path, { ...options, headers }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Ha ocurrido un error');
    }
    return data;
  });
}

function formatDate(dateText) {
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(dateText));
}

function money(value) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
}

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.className = `form-message ${isError ? 'error' : 'success'}`;
}

function clearMessage(element) {
  element.textContent = '';
  element.className = 'form-message';
}

function setVisible(element, visible) {
  element.classList.toggle('hidden', !visible);
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('hotel-token');
  renderAuthOnly();
}

function renderAuthOnly() {
  setVisible(authPanel, true);
  setVisible(appPanel, false);
  setVisible(adminPanel, false);
}

function renderAuthenticated() {
  setVisible(authPanel, false);
  setVisible(appPanel, true);
  setVisible(adminPanel, state.user?.role === 'admin');
  welcomeText.textContent = `Sesión iniciada como ${state.user.name} (${state.user.role})`;
}

function cardTemplate(title, meta, notes = '') {
  const node = reservationTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector('.title').textContent = title;
  node.querySelector('.meta').textContent = meta;
  node.querySelector('.notes').textContent = notes;
  return node;
}

function renderRoomOptions(rooms) {
  roomSelect.innerHTML = '';
  rooms.forEach((room) => {
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = `${room.number} · ${room.type} · ${room.capacity} plazas · ${money(room.price_per_night)}`;
    roomSelect.appendChild(option);
  });
}

function renderHotelOptions(hotels) {
  hotelSelect.innerHTML = '<option value="">Selecciona un hotel...</option>';
  hotels.forEach((hotel) => {
    const option = document.createElement('option');
    option.value = hotel.id;
    option.textContent = `${hotel.name} (${hotel.city})`;
    hotelSelect.appendChild(option);
  });
}

function renderRoomOptionsByHotel(hotelId) {
  roomSelect.innerHTML = '';
  const filtered = state.rooms.filter((room) => room.hotel_id === Number(hotelId));
  filtered.forEach((room) => {
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = `${room.number} · ${room.type} · ${room.capacity} plazas · ${money(room.price_per_night)}`;
    roomSelect.appendChild(option);
  });
}

function renderAvailability(rooms, checkInDate, checkOutDate) {
  availabilityResults.innerHTML = '';

  if (!rooms.length) {
    availabilityResults.innerHTML = '<p class="empty">No hay habitaciones disponibles para esas fechas.</p>';
    return;
  }

  rooms.forEach((room) => {
    const item = cardTemplate(
      `${room.hotel_name || 'Hotel'} - Habitación ${room.number} · ${room.type}`,
      `Capacidad: ${room.capacity} · ${money(room.price_per_night)} por noche`,
      room.description || ''
    );
    item.classList.add(room.available ? 'available' : 'unavailable');
    availabilityResults.appendChild(item);
  });

  renderRoomOptions(rooms.filter((room) => room.available));
  if (!roomSelect.options.length) {
    api('/api/rooms').then(({ rooms: allRooms }) => renderRoomOptions(allRooms)).catch(() => {});
  }
}

function renderReservationsList(container, reservations, isAdmin = false) {
  container.innerHTML = '';

  if (!reservations.length) {
    container.innerHTML = '<p class="empty">No hay reservas registradas.</p>';
    return;
  }

  reservations.forEach((reservation) => {
    if (isAdmin) {
      // Enhanced view for admin with guest information
      const checkInDate = new Date(reservation.check_in_date);
      const checkOutDate = new Date(reservation.check_out_date);
      const isUpcoming = checkOutDate >= new Date();
      const daysCount = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      const node = document.createElement('article');
      node.className = `list-item reservation-card ${isUpcoming ? 'upcoming' : 'past'}`;
      
      const statusColor = reservation.status === 'confirmed' ? '✓' : reservation.status === 'pending' ? '⏳' : '✗';
      const statusText = reservation.status === 'confirmed' ? 'Confirmada' : reservation.status === 'pending' ? 'Pendiente' : 'Cancelada';
      
      node.innerHTML = `
        <div>
          <strong class="title">📋 Reserva #${reservation.id}</strong>
          <p class="meta">
            <span class="badge">${statusColor} ${statusText}</span>
            <span class="room-badge">Habitación ${reservation.number}</span>
          </p>
          <div class="reservation-details">
            <div class="detail-row">
              <span class="detail-label">🏨 Hotel:</span>
              <span class="detail-value">${reservation.hotel_name || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">👤 Huésped Registrado:</span>
              <span class="detail-value">${reservation.user_name || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">👥 Huésped en Reserva:</span>
              <span class="detail-value">${([reservation.guest_name, reservation.guest_lastname].filter(Boolean).join(' ') || '-')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📧 Email:</span>
              <span class="detail-value">${reservation.user_email || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🏠 Tipo de Habitación:</span>
              <span class="detail-value">${reservation.type || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 Fechas:</span>
              <span class="detail-value">${formatDate(reservation.check_in_date)} → ${formatDate(reservation.check_out_date)} (${daysCount} noches)</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">👥 Cantidad de Huéspedes:</span>
              <span class="detail-value">${reservation.guests || '-'}</span>
            </div>
            ${reservation.notes ? `
            <div class="detail-row">
              <span class="detail-label">📝 Notas:</span>
              <span class="detail-value">${reservation.notes}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">💰 Total:</span>
              <span class="detail-value price">${money(reservation.total_price || 0)}</span>
            </div>    
          </div>
        </div>
        <div class="item-actions"></div>
      `;
      
      const actions = node.querySelector('.item-actions');
      const viewButton = document.createElement('button');
      viewButton.className = 'secondary';
      viewButton.textContent = 'Ver';
      viewButton.onclick = () => { showReservationDetail(reservation); location.hash = `#/admin/reservations/${reservation.id}`; };
      actions.append(viewButton);
      
      const statusSelect = document.createElement('select');
      ['confirmed', 'pending', 'cancelled'].forEach((status) => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status === 'confirmed' ? 'Confirmada' : status === 'pending' ? 'Pendiente' : 'Cancelada';
        if (reservation.status === status) option.selected = true;
        statusSelect.appendChild(option);
      });

      const statusButton = document.createElement('button');
      statusButton.textContent = 'Actualizar estado';
      statusButton.onclick = async () => {
        await api(`/api/admin/reservations/${reservation.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: statusSelect.value }),
        });
        await refreshDashboard();
      };

      actions.append(statusSelect, statusButton);
      container.appendChild(node);
    } else {
      // Original view for regular users
      const title = `Reserva #${reservation.id} · ${reservation.hotel_name} - Habitación ${reservation.number}`;
      const meta = `${formatDate(reservation.check_in_date)} → ${formatDate(reservation.check_out_date)} · ${reservation.guests} huésped(es) · ${reservation.status}`;
      const notes = `${reservation.type} · ${money(reservation.total_price)} · Huésped: ${reservation.guest_name} ${reservation.guest_lastname}`;
      const item = cardTemplate(title, meta, notes);

      const actions = item.querySelector('.item-actions');
      
      const editButton = document.createElement('button');
      editButton.className = 'secondary';
      editButton.textContent = 'Editar';
      editButton.onclick = () => {
        hotelSelect.value = '';
        renderRoomOptionsByHotel('');
        reservationForm.roomId.value = reservation.room_id;
        reservationForm.guestName.value = reservation.guest_name;
        reservationForm.guestLastname.value = reservation.guest_lastname;
        reservationForm.checkInDate.value = reservation.check_in_date;
        reservationForm.checkOutDate.value = reservation.check_out_date;
        reservationForm.guests.value = reservation.guests;
        reservationForm.notes.value = reservation.notes || '';
        state.editingReservationId = reservation.id;
        reservationForm.querySelector('button[type="submit"]').textContent = 'Guardar cambios';
      };

      const cancelButton = document.createElement('button');
      cancelButton.className = 'danger';
      cancelButton.textContent = 'Cancelar';
      cancelButton.onclick = async () => {
        if (!confirm('¿Quieres cancelar esta reserva?')) return;
        await api(`/api/reservations/${reservation.id}`, { method: 'DELETE' });
        await refreshDashboard();
      };

      actions.append(editButton, cancelButton);
      container.appendChild(item);
    }
  });
}

function showAdminView(view) {
  // views: 'rooms', 'reservations', 'users', 'detail'
  adminRoomsPage && (adminRoomsPage.style.display = view === 'rooms' ? '' : 'none');
  adminReservationsPage && (adminReservationsPage.style.display = view === 'reservations' ? '' : 'none');
  adminUsersPage && (adminUsersPage.style.display = view === 'users' ? '' : 'none');
  adminReservationDetail && (adminReservationDetail.style.display = view === 'detail' ? '' : 'none');
}

function showReservationDetail(reservation) {
  if (!adminReservationDetailCard) return;
  const daysCount = Math.ceil((new Date(reservation.check_out_date) - new Date(reservation.check_in_date)) / (1000*60*60*24));
  adminReservationDetailCard.innerHTML = `
    <h3>Reserva #${reservation.id} · ${reservation.hotel_name || '-'} - Habitación ${reservation.number}</h3>
    <div class="reservation-details">
      <div class="detail-row"><span class="detail-label">Huésped:</span><span class="detail-value">${([reservation.guest_name, reservation.guest_lastname].filter(Boolean).join(' ') || '-')}</span></div>
      <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${reservation.user_email || '-'}</span></div>
      <div class="detail-row"><span class="detail-label">Fechas:</span><span class="detail-value">${formatDate(reservation.check_in_date)} → ${formatDate(reservation.check_out_date)} (${daysCount} noches)</span></div>
      <div class="detail-row"><span class="detail-label">Huéspedes:</span><span class="detail-value">${reservation.guests || '-'}</span></div>
      ${reservation.notes ? `<div class="detail-row"><span class="detail-label">Notas:</span><span class="detail-value">${reservation.notes}</span></div>` : ''}
      <div class="detail-row"><span class="detail-label">Total:</span><span class="detail-value price">${money(reservation.total_price || 0)}</span></div>
    </div>
  `;
  showAdminView('detail');
}

function handleAdminRoute() {
  const hash = location.hash.replace('#', '') || '/admin/rooms';
  const parts = hash.split('/').filter(Boolean);
  // expected: ['admin','rooms'] or ['admin','reservations','123'] etc
  if (parts[0] !== 'admin') return;
  const section = parts[1] || 'rooms';
  if (section === 'rooms') {
    showAdminView('rooms');
  } else if (section === 'reservations') {
    if (parts[2]) {
      const id = Number(parts[2]);
      const reservation = state.admin.reservations.find(r => r.id === id) || state.reservations.find(r => r.id === id);
      if (reservation) {
        showReservationDetail(reservation);
      } else {
        showAdminView('reservations');
      }
    } else {
      showAdminView('reservations');
    }
  } else if (section === 'users') {
    showAdminView('users');
  } else {
    showAdminView('rooms');
  }
}

window.addEventListener('hashchange', handleAdminRoute);
if (navAdminRooms) navAdminRooms.addEventListener('click', () => { location.hash = '#/admin/rooms'; });
if (navAdminReservations) navAdminReservations.addEventListener('click', () => { location.hash = '#/admin/reservations'; });
if (navAdminUsers) navAdminUsers.addEventListener('click', () => { location.hash = '#/admin/users'; });
if (adminBackToList) adminBackToList.addEventListener('click', () => { location.hash = '#/admin/reservations'; });

function renderRoomsAdmin(rooms) {
  roomsAdminList.innerHTML = '';

  if (!rooms.length) {
    roomsAdminList.innerHTML = '<p class="empty">No hay habitaciones.</p>';
    return;
  }

  rooms.forEach((room) => {
    const item = cardTemplate(
      `Habitación ${room.number} · ${room.type}`,
      `${room.capacity} plazas · ${money(room.price_per_night)} · ${room.is_active ? 'activa' : 'inactiva'}`,
      room.description || ''
    );

    const actions = item.querySelector('.item-actions');
    const editButton = document.createElement('button');
    editButton.className = 'secondary';
    editButton.textContent = 'Editar';
    editButton.onclick = () => {
      roomForm.id.value = room.id;
        if (roomForm.hotelId) roomForm.hotelId.value = room.hotel_id || '';
      roomForm.number.value = room.number;
      roomForm.type.value = room.type;
      roomForm.capacity.value = room.capacity;
      roomForm.pricePerNight.value = room.price_per_night;
      roomForm.description.value = room.description || '';
      roomForm.isActive.checked = Boolean(room.is_active);
      state.editingRoomId = room.id;
      roomForm.querySelector('button[type="submit"]').textContent = 'Guardar cambios';
    };

    const toggleButton = document.createElement('button');
    toggleButton.className = 'danger';
    toggleButton.textContent = room.is_active ? 'Desactivar' : 'Activar';
    toggleButton.onclick = async () => {
      await api(`/api/admin/rooms/${room.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          number: room.number,
          type: room.type,
          capacity: room.capacity,
          pricePerNight: room.price_per_night,
          description: room.description || '',
          isActive: !room.is_active,
        }),
      });
      await refreshDashboard();
    };

    actions.append(editButton, toggleButton);
    roomsAdminList.appendChild(item);
  });
}

function renderUsersAdmin(users) {
  usersAdminList.innerHTML = '';

  if (!users.length) {
    usersAdminList.innerHTML = '<p class="empty">No hay usuarios.</p>';
    return;
  }

  users.forEach((user) => {
    // Count reservations for this user
    const userReservations = state.admin.reservations.filter(r => r.user_id === user.id);
    const activeReservations = userReservations.filter(r => new Date(r.check_out_date) >= new Date());
    
    // Create enhanced card with more information
    const node = document.createElement('article');
    node.className = 'list-item guest-card';
    
    const guestIcon = user.role === 'admin' ? '👤' : '🏨';
    const roleLabel = user.role === 'admin' ? 'Administrador' : 'Huésped';
    
    node.innerHTML = `
      <div>
        <strong class="title">${guestIcon} ${user.name}</strong>
        <p class="meta">
          <span class="badge">${roleLabel}</span>
          <span class="guest-email">${user.email}</span>
        </p>
        <p class="guest-stats">
          <span class="stat-badge">📅 ${userReservations.length} reserva${userReservations.length !== 1 ? 's' : ''}</span>
          ${activeReservations.length > 0 ? `<span class="stat-badge active">✓ ${activeReservations.length} activa${activeReservations.length !== 1 ? 's' : ''}</span>` : ''}
        </p>
        <p class="notes">Registro: ${formatDate(user.created_at)}</p>
      </div>
      <div class="item-actions">
        <span class="status-indicator ${userReservations.length > 0 ? 'has-reservations' : 'no-reservations'}"></span>
      </div>
    `;
    
    usersAdminList.appendChild(node);
  });
}

async function loadRooms() {
  const { rooms } = await api('/api/rooms');
  state.rooms = rooms;
  renderRoomOptions(rooms);
}

async function loadHotels() {
  const { hotels } = await api('/api/hotels');
  state.hotels = hotels;
  renderHotelOptions(hotels);
  if (adminHotelSelect) {
    adminHotelSelect.innerHTML = '<option value="">Selecciona un hotel...</option>';
    hotels.forEach((h) => {
      const option = document.createElement('option');
      option.value = h.id;
      option.textContent = `${h.name} (${h.city})`;
      adminHotelSelect.appendChild(option);
    });
  }
}

async function loadReservations() {
  const { reservations } = await api('/api/reservations');
  state.reservations = reservations;
  reservationCount.textContent = String(reservations.length);
  renderReservationsList(myReservations, reservations, false);
}

async function loadAdminData() {
  const [metrics, rooms, users, reservations] = await Promise.all([
    api('/api/admin/metrics'),
    api('/api/admin/rooms'),
    api('/api/admin/users'),
    api('/api/admin/reservations'),
  ]);

  state.admin.metrics = metrics;
  state.admin.rooms = rooms.rooms;
  state.admin.users = users.users;
  state.admin.reservations = reservations.reservations;

  statUsers.textContent = metrics.users;
  statRooms.textContent = metrics.rooms;
  statReservations.textContent = metrics.reservations;

  renderRoomsAdmin(state.admin.rooms);
  renderUsersAdmin(state.admin.users);
  renderReservationsList(adminReservationsListFull || adminReservationsList, state.admin.reservations, true);
}

async function loadPublicStats() {
  const metrics = await api('/api/stats');
  statUsers.textContent = metrics.users;
  statRooms.textContent = metrics.rooms;
  statReservations.textContent = metrics.reservations;
}

async function refreshDashboard() {
  await loadHotels();
  await loadRooms();
  await loadReservations();
  await loadPublicStats();
  if (state.user.role === 'admin') {
    await loadAdminData();
  }
}

async function loadMe() {
  const data = await api('/api/me');
  state.user = data.user;
  renderAuthenticated();
  await refreshDashboard();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage(document.getElementById('login-message'));

  const formData = new FormData(loginForm);
  try {
    const response = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });

    state.token = response.token;
    state.user = response.user;
    localStorage.setItem('hotel-token', response.token);
    renderAuthenticated();
    await refreshDashboard();
    showMessage(document.getElementById('login-message'), 'Sesión iniciada correctamente.');
  } catch (error) {
    showMessage(document.getElementById('login-message'), error.message, true);
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage(document.getElementById('register-message'));

  const formData = new FormData(registerForm);
  try {
    const response = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });

    state.token = response.token;
    state.user = response.user;
    localStorage.setItem('hotel-token', response.token);
    renderAuthenticated();
    await refreshDashboard();
    showMessage(document.getElementById('register-message'), 'Cuenta creada correctamente.');
  } catch (error) {
    showMessage(document.getElementById('register-message'), error.message, true);
  }
});

availabilityForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(availabilityForm);
  try {
    const data = await api(`/api/availability?checkIn=${formData.get('checkIn')}&checkOut=${formData.get('checkOut')}`);
    state.rooms = data.rooms;
    renderAvailability(data.rooms, data.checkInDate, data.checkOutDate);
  } catch (error) {
    availabilityResults.innerHTML = `<p class="empty error">${error.message}</p>`;
  }
});

hotelSelect.addEventListener('change', (event) => {
  const hotelId = event.target.value;
  if (hotelId) {
    renderRoomOptionsByHotel(hotelId);
  } else {
    roomSelect.innerHTML = '';
  }
});

reservationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = document.getElementById('reservation-message');
  clearMessage(message);
  const formData = new FormData(reservationForm);
  const payload = {
    roomId: Number(formData.get('roomId')),
    guestName: formData.get('guestName'),
    guestLastname: formData.get('guestLastname'),
    checkInDate: formData.get('checkInDate'),
    checkOutDate: formData.get('checkOutDate'),
    guests: Number(formData.get('guests')),
    notes: formData.get('notes'),
  };

  try {
    if (state.editingReservationId) {
      await api(`/api/reservations/${state.editingReservationId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      showMessage(message, 'Reserva actualizada correctamente.');
    } else {
      await api('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showMessage(message, 'Reserva creada correctamente.');
    }

    state.editingReservationId = null;
    reservationForm.querySelector('button[type="submit"]').textContent = 'Reservar';
    reservationForm.reset();
    reservationForm.guests.value = 1;
    await refreshDashboard();
  } catch (error) {
    showMessage(message, error.message, true);
  }
});

roomForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(roomForm);
  const payload = {
    number: formData.get('number'),
    hotelId: Number(formData.get('hotelId')),
    type: formData.get('type'),
    capacity: Number(formData.get('capacity')),
    pricePerNight: Number(formData.get('pricePerNight')),
    description: formData.get('description'),
    isActive: formData.get('isActive') === 'on',
  };

  try {
    if (state.editingRoomId) {
      await api(`/api/admin/rooms/${state.editingRoomId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } else {
      await api('/api/admin/rooms', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    state.editingRoomId = null;
    roomForm.querySelector('button[type="submit"]').textContent = 'Guardar habitación';
    roomForm.reset();
    roomForm.isActive.checked = true;
    await refreshDashboard();
  } catch (error) {
    alert(error.message);
  }
});

logoutButton.addEventListener('click', logout);
refreshButton.addEventListener('click', refreshDashboard);

document.addEventListener('DOMContentLoaded', async () => {
  if (!state.token) {
    renderAuthOnly();
  }

  try {
    if (state.token) {
      await loadMe();
    } else {
      await loadPublicStats();
      const { rooms } = await api('/api/rooms');
      renderRoomOptions(rooms);
    }
  } catch (error) {
    logout();
  }
  // initial route handling
  handleRoute();
});

function showPage(page) {
  // pages: home, availability, book, reservations
  if (page === 'none') {
    homePage && (homePage.style.display = 'none');
    availabilityPage && (availabilityPage.style.display = 'none');
    bookPage && (bookPage.style.display = 'none');
    reservationsPage && (reservationsPage.style.display = 'none');
    return;
  }
  homePage && (homePage.style.display = page === 'home' ? '' : 'none');
  availabilityPage && (availabilityPage.style.display = page === 'availability' ? '' : 'none');
  bookPage && (bookPage.style.display = page === 'book' ? '' : 'none');
  reservationsPage && (reservationsPage.style.display = page === 'reservations' ? '' : 'none');
}

function setActiveMainNav(hashPrefix) {
  const mapping = {
    '#/': navHome,
    '#/availability': navAvailability,
    '#/book': navBook,
    '#/reservations': navReservations,
    '#/admin': navAdmin,
  };
  Object.values(mapping).forEach(el => el && el.classList && el.classList.remove('active'));
  const el = mapping[hashPrefix];
  if (el && el.classList) el.classList.add('active');
}

function handleRoute() {
  const hash = location.hash || '#/';
  // admin routes handled separately
  const isAdminRoute = hash.startsWith('#/admin');
  // show admin panel only on admin routes and when user is admin
  setVisible(adminPanel, isAdminRoute && state.user?.role === 'admin');
  if (isAdminRoute) {
    handleAdminRoute();
    setActiveMainNav('#/admin');
    showPage('none');
    return;
  }
  // determine active main nav by checking more specific routes first
  let pagePrefix = '#/';
  if (hash.startsWith('#/availability')) pagePrefix = '#/availability';
  else if (hash.startsWith('#/book')) pagePrefix = '#/book';
  else if (hash.startsWith('#/reservations')) pagePrefix = '#/reservations';
  setActiveMainNav(pagePrefix);
  if (hash.startsWith('#/availability')) showPage('availability');
  else if (hash.startsWith('#/book')) showPage('book');
  else if (hash.startsWith('#/reservations')) { showPage('reservations'); refreshDashboard(); }
  else showPage('home');
}

window.addEventListener('hashchange', handleRoute);
if (navHome) navHome.addEventListener('click', () => { location.hash = '#/'; });
if (navAvailability) navAvailability.addEventListener('click', () => { location.hash = '#/availability'; });
if (navBook) navBook.addEventListener('click', () => { location.hash = '#/book'; });
if (navReservations) navReservations.addEventListener('click', () => { location.hash = '#/reservations'; });
if (navAdmin) navAdmin.addEventListener('click', () => { location.hash = '#/admin/rooms'; });
