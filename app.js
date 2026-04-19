let cases = JSON.parse(localStorage.getItem('law-cases')) || [];
let editingId = null;

function renderTable() {
  const tbody = document.getElementById('cases-table-body');
  const emptyState = document.getElementById('empty-state');
  const sorted = [...cases].sort((a, b) => new Date(a.date) - new Date(b.date));
  tbody.innerHTML = '';
  if (sorted.length === 0) {
    emptyState.style.display = 'block';
    updateSummary([]);
    return;
  }
  emptyState.style.display = 'none';
  sorted.forEach(function(c) {
    const days = getDaysRemaining(c.date);
    const badge = buildDaysBadge(days);
    const dateFormatted = formatDate(c.date);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${escapeHtml(c.name)}</strong></td>
      <td>${escapeHtml(c.action)}</td>
      <td>${dateFormatted}</td>
      <td>${badge}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="openEditModal(${c.id})">עריכה</button>
          <button class="btn-delete" onclick="deleteCase(${c.id})">מחיקה</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
  updateSummary(sorted);
}

function updateSummary(sorted) {
  let urgent = 0, soon = 0, ok = 0;
  sorted.forEach(function(c) {
    const days = getDaysRemaining(c.date);
    if (days < 0) urgent++;
    else if (days <= 7) soon++;
    else ok++;
  });
  document.getElementById('count-urgent').textContent = urgent;
  document.getElementById('count-soon').textContent = soon;
  document.getElementById('count-ok').textContent = ok;
  document.getElementById('count-total').textContent = sorted.length;
}

function getDaysRemaining(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function buildDaysBadge(days) {
  if (days < 0) return `<span class="days-badge overdue">איחור של ${Math.abs(days)} ימים</span>`;
  if (days === 0) return `<span class="days-badge overdue">היום!</span>`;
  if (days <= 7) return `<span class="days-badge soon">${days} ימים</span>`;
  return `<span class="days-badge ok">${days} ימים</span>`;
}

function openModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'הוספת תיק חדש';
  document.getElementById('input-name').value = '';
  document.getElementById('input-action').value = '';
  document.getElementById('input-date').value = '';
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('input-name').focus();
}

function openEditModal(id) {
  const c = cases.find(function(x) { return x.id === id; });
  if (!c) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'עריכת תיק';
  document.getElementById('input-name').value = c.name;
  document.getElementById('input-action').value = c.action;
  document.getElementById('input-date').value = c.date;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('input-name').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function closeModalOnOverlay(event) {
  if (event.target === document.getElementById('modal-overlay')) closeModal();
}

function saveCase() {
  const name   = document.getElementById('input-name').value.trim();
  const action = document.getElementById('input-action').value.trim();
  const date   = document.getElementById('input-date').value;
  if (!name || !action || !date) { alert('נא למלא את כל השדות'); return; }
  if (editingId !== null) {
    cases = cases.map(function(c) {
      return c.id === editingId ? { id: c.id, name, action, date } : c;
    });
  } else {
    cases.push({ id: Date.now(), name, action, date });
  }
  saveToStorage();
  closeModal();
  renderTable();
}

function deleteCase(id) {
  const c = cases.find(function(x) { return x.id === id; });
  if (!c) return;
  if (!confirm(`למחוק את התיק "${c.name}"?`)) return;
  cases = cases.filter(function(x) { return x.id !== id; });
  saveToStorage();
  renderTable();
}

function saveToStorage() {
  localStorage.setItem('law-cases', JSON.stringify(cases));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

renderTable();