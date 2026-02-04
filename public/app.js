// ================= AUTH API =================

async function apiMe() {
  const res = await fetch('/api/auth/me');
  return res.json();
}

async function apiLogin(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Login failed');
  return json;
}

async function apiLogout() {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  return res.json();
}

// ================= WORKOUTS API =================

async function apiGetWorkouts() {
  const res = await fetch('/api/workouts');
  if (!res.ok) throw new Error('Failed to load workouts');
  return res.json();
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
  const res = await fetch(`/api/workouts/${id}`, {
    method: 'DELETE',
  });

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
    el('authStatus').textContent = `Logged in as: ${me.email}`;
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

// ================= LOAD DATA =================

async function load() {
  try {
    setMessage('Loading...');
    const items = await apiGetWorkouts();
    renderTable(items);
    setMessage(`Loaded ${items.length} workouts`);
  } catch (e) {
    setMessage(e.message, true);
  }
}

// ================= EVENTS =================

document.addEventListener('DOMContentLoaded', async () => {
  // Login submit
  el('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiLogin(el('email').value.trim(), el('password').value);
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
    await refreshAuthUI();
    setMessage('Logged out');
  });

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
      date: el('date').value.trim(),
      notes: el('notes').value.trim(),
      status: el('status').value.trim(),
    };

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
