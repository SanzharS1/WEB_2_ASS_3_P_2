// ================= AUTH API =================

async function apiMe() {
  const res = await fetch('/api/auth/me');
  return res.json();
}

async function apiRegister(name, email, password) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Register failed');
  return json;
}

async function apiLogin(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Login failed');
  return json;
}

async function apiLogout() {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  return res.json();
}

// ================= WORKOUTS API (PAGINATION) =================

async function apiGetWorkouts(page = 1, limit = 10) {
  const res = await fetch(`/api/workouts?page=${page}&limit=${limit}`);
  const json = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(json.error || 'Failed to load workouts');

  return json;
}

async function apiCreateWorkout(data) {
  const res = await fetch('/api/workouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Create failed');
  return json;
}

async function apiUpdateWorkout(id, data) {
  const res = await fetch(`/api/workouts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Update failed');
  return json;
}

async function apiDeleteWorkout(id) {
  const res = await fetch(`/api/workouts/${id}`, { method: 'DELETE' });

  // DELETE returns 204 (no body)
  if (res.status === 204) return { ok: true };

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Delete failed');
  return json;
}

// ================= UI HELPERS =================

function el(id) {
  return document.getElementById(id);
}

function setMessage(text, isError = false) {
  const box = el('msg');
  box.textContent = text;
  box.className = isError ? 'error-msg' : '';
}

// email validation (простой, но нормальный)
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

// date validation: YYYY-MM-DD
function isValidISODate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function clearForm() {
  el('workoutId').value = '';
  el('name').value = '';
  el('duration').value = '';
  el('type').value = '';
  el('intensity').value = '';
  el('calories').value = '';
  el('date').value = '';
  el('notes').value = '';
  el('status').value = '';
  el('submitBtn').textContent = 'Create';
  el('cancelEdit').style.display = 'none';
}

function fillFormForEdit(w) {
  el('workoutId').value = w._id;
  el('name').value = w.name || '';
  el('duration').value = w.duration ?? '';
  el('type').value = w.type || '';
  el('intensity').value = w.intensity || '';
  el('calories').value = w.calories ?? '';
  el('date').value = w.date || '';
  el('notes').value = w.notes || '';
  el('status').value = w.status || '';
  el('submitBtn').textContent = 'Update';
  el('cancelEdit').style.display = 'inline-block';
}

// ================= AUTH UI =================

async function refreshAuthUI() {
  const me = await apiMe();

  if (me.authenticated) {
    const who = me.name ? `${me.name} (${me.email})` : me.email;
    el('authStatus').textContent = `Logged in as: ${who}${me.role ? ` (${me.role})` : ''}`;
    el('logoutBtn').style.display = 'inline-block';
  } else {
    el('authStatus').textContent = 'Not logged in';
    el('logoutBtn').style.display = 'none';
  }

  return me.authenticated;
}

// ================= TABLE RENDER =================

function renderTable(items) {
  const tbody = el('tbody');
  tbody.innerHTML = '';

  items.forEach(w => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${w._id}</td>
      <td>${w.name || ''}</td>
      <td>${w.duration ?? ''}</td>
      <td>${w.type || ''}</td>
      <td>${w.intensity || ''}</td>
      <td>${w.calories ?? ''}</td>
      <td>${w.date || ''}</td>
      <td>${w.status || ''}</td>
      <td>
        <button class="btn edit">Edit</button>
        <button class="btn delete">Delete</button>
      </td>
    `;

    tr.querySelector('.edit').onclick = () => fillFormForEdit(w);

    tr.querySelector('.delete').onclick = async () => {
      if (!confirm('Delete this workout?')) return;
      try {
        await apiDeleteWorkout(w._id);
        setMessage('Deleted successfully');
        await load();
      } catch (e) {
        setMessage(e.message, true);
      }
    };

    tbody.appendChild(tr);
  });
}

// ================= PAGINATION STATE =================

let currentPage = 1;
const pageSize = 10;
let totalPages = 1;

function updatePaginationUI() {
  const prev = el('prevPage');
  const next = el('nextPage');
  const info = el('pageInfo');

  if (!prev || !next || !info) return;

  prev.disabled = currentPage <= 1;
  next.disabled = currentPage >= totalPages;
  info.textContent = `Page ${currentPage} / ${totalPages}`;
}

// ================= LOAD DATA =================

async function load() {
  try {
    setMessage('Loading...');

    const data = await apiGetWorkouts(currentPage, pageSize);
    const items = Array.isArray(data.items) ? data.items : [];

    totalPages = Number(data.pages || 1);

    renderTable(items);
    updatePaginationUI();

    setMessage(`Loaded ${items.length} workouts (page ${data.page || currentPage}/${data.pages || totalPages}, total ${data.total ?? '?'})`);
  } catch (e) {
    if (String(e.message).toLowerCase().includes('unauthorized')) {
      renderTable([]);
      updatePaginationUI();
      setMessage('Unauthorized: please login to view workouts', true);
      return;
    }
    setMessage(e.message, true);
  }
}

// ================= EVENTS =================

document.addEventListener('DOMContentLoaded', async () => {
  // Register submit
  const regForm = el('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = el('regName').value.trim();
      const email = el('regEmail').value.trim();
      const password = el('regPassword').value;

      if (!name) return setMessage('Name is required', true);
      if (!isValidEmail(email)) return setMessage('Invalid email', true);
      if (!password || password.length < 6) return setMessage('Password must be at least 6 characters', true);

      try {
        await apiRegister(name, email, password); // auto-login на бэкенде
        currentPage = 1;
        await refreshAuthUI();
        setMessage('Registered and logged in');
        await load();
        regForm.reset();
      } catch (err) {
        setMessage(err.message, true);
      }
    });
  }

  // Login submit
  el('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = el('email').value.trim();
    const password = el('password').value;

    if (!isValidEmail(email)) return setMessage('Invalid email', true);
    if (!password || password.length < 6) return setMessage('Password must be at least 6 characters', true);

    try {
      await apiLogin(email, password);
      currentPage = 1;
      await refreshAuthUI();
      setMessage('Login success');
      await load();
    } catch (err) {
      setMessage(err.message, true);
    }
  });

  // Logout
  el('logoutBtn').addEventListener('click', async () => {
    await apiLogout();
    currentPage = 1;
    await refreshAuthUI();
    setMessage('Logged out');
    await load();
  });

  // Pagination buttons
  const prevBtn = el('prevPage');
  const nextBtn = el('nextPage');

  if (prevBtn) {
    prevBtn.addEventListener('click', async () => {
      if (currentPage > 1) {
        currentPage--;
        await load();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      if (currentPage < totalPages) {
        currentPage++;
        await load();
      }
    });
  }

  // Create/Update workout
  el('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    setMessage('');

    const id = el('workoutId').value.trim();

    const data = {
      name: el('name').value.trim(),
      duration: Number(el('duration').value),
      type: el('type').value.trim(),
      intensity: el('intensity').value.trim(),
      calories: Number(el('calories').value),
      date: el('date').value.trim(), // YYYY-MM-DD because input type="date"
      notes: el('notes').value.trim(),
      status: el('status').value.trim(),
    };

    // ✅ date validation (то, что ты просил)
    if (!isValidISODate(data.date)) {
      setMessage('Invalid date. Please choose a valid date.', true);
      return;
    }

    try {
      if (id) {
        await apiUpdateWorkout(id, data);
        setMessage('Updated successfully');
      } else {
        await apiCreateWorkout(data);
        setMessage('Created successfully');
      }

      clearForm();
      await load();
    } catch (err) {
      setMessage(err.message, true);
    }
  });

  // Cancel edit
  el('cancelEdit').addEventListener('click', () => {
    clearForm();
    setMessage('Edit canceled');
  });

  await refreshAuthUI();
  await load();
});
