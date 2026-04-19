// ========================
// שלב 1: טעינת הנתונים מהדפדפן
// ========================
// localStorage שומר את הנתונים גם אחרי סגירת הדפדפן

let cases = JSON.parse(localStorage.getItem('law-cases')) || [];
let editingId = null; // מספר התיק שאנחנו עורכים (null = הוספה חדשה)

// ========================
// שלב 2: הצגת הטבלה
// ========================

function renderTable() {
  const tbody = document.getElementById('cases-table-body');
  const emptyState = document.getElementById('empty-state');

  // מיון לפי תאריך (הקרוב ביותר קודם)
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

// ========================
// שלב 3: כרטיסי הסיכום למעלה
// ========================

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

// ========================
// שלב 4: חישוב ימים נותרים
// ========================

function getDaysRemaining(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function buildDaysBadge(days) {
  if (days < 0) {
    return `<span class="days-badge overdue">איחור של ${Math.abs(days)} ימים</span>`;
  } else if (days === 0) {
    return `<span class="days-badge overdue">היום!</span>`;
  } else if (days <= 7) {
    return `<span class="days-badge soon">${days} ימים</span>`;
  } else {
    return `<span class="days-badge ok">${days} ימים</span>`;
  }
}

// ========================
// שלב 5: פתיחת חלון הוספה/עריכה
// ========================

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
  if (event.target === document.getElementById('modal-overlay')) {
    closeModal();
  }
}

// ========================
// שלב 6: שמירת תיק
// ========================

function saveCase() {
  const name   = document.getElementById('input-name').value.trim();
  const action = document.getElementById('input-action').value.trim();
  const date   = document.getElementById('input-date').value;

  // בדיקה שכל השדות מולאו
  if (!name || !action || !date) {
    alert('נא למלא את כל השדות');
    return;
  }

  if (editingId !== null) {
    // עריכה של תיק קיים
    cases = cases.map(function(c) {
      if (c.id === editingId) {
        return { id: c.id, name: name, action: action, date: date };
      }
      return c;
    });
  } else {
    // הוספת תיק חדש
    const newCase = {
      id: Date.now(), // מספר ייחודי לכל תיק
      name: name,
      action: action,
      date: date
    };
    cases.push(newCase);
  }

  saveToStorage();
  closeModal();
  renderTable();
}

// ========================
// שלב 7: מחיקת תיק
// ========================

function deleteCase(id) {
  const c = cases.find(function(x) { return x.id === id; });
  if (!c) return;

  if (!confirm(`למחוק את התיק "${c.name}"?`)) return;

  cases = cases.filter(function(x) { return x.id !== id; });
  saveToStorage();
  renderTable();
}

// ========================
// שלב 8: שמירה בדפדפן
// ========================

function saveToStorage() {
  localStorage.setItem('law-cases', JSON.stringify(cases));
}

// ========================
// פונקציות עזר
// ========================

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ========================
// הפעלה ראשונית
// ========================
renderTable();
