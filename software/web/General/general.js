// General - Tabla de actividades por día/empleado con animaciones, reloj y fila “sticky” centrada (simulada con banda)

const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

const state = {
  currentDayIndex: new Date().getDay(),
  trabajadores: [],
  currentEmpPage: 0,
  pageSize: 8, // 🔹 8 empleados visibles + 3 fijas (Horario, Actividad, Puntos)
  lastRowsData: [],
  lastHourScrolled: null,
  lastTargetIndex: 0
};

const DOM = {};
let clockIntervalId = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  cacheSelectors();
  setupInitialAnimations();
  bindUIEvents();

  try {
    const resp = await fetch('/empleados.json');
    if (!resp.ok) throw new Error('Error al obtener los empleados');
    state.trabajadores = await resp.json();
  } catch (err) {
    console.error('Error al cargar empleados:', err);
    state.trabajadores = [];
  }

  renderForCurrentState();
  startClock();
  window.addEventListener('resize', () => adjustCenterBandHeight());
}

/* Cacheo de selectores */
function cacheSelectors() {
  DOM.titulo = document.querySelector('h2');
  DOM.clockContainer = document.querySelector('.clock-container');
  DOM.tableWrapper = document.getElementById('table-wrapper');
  DOM.centerBand = document.querySelector('.sticky-center-band');
  DOM.nextDayBtn = document.getElementById('next-day-btn');
  DOM.todayBtn = document.getElementById('today-btn');
  DOM.prevEmpBtn = document.getElementById('prev-emp-page');
  DOM.nextEmpBtn = document.getElementById('next-emp-page');
  DOM.tasksDayLabel = document.getElementById('tasks-day');
  DOM.workerTable = document.getElementById('worker-table');
  DOM.tbody = DOM.workerTable.querySelector('tbody');
  DOM.theadRow = DOM.workerTable.querySelector('thead tr');

  // 🔹 Modal
  DOM.modal = document.getElementById('task-modal');
  DOM.modalTaskName = document.getElementById('modal-task-name');
  DOM.modalTaskDesc = document.getElementById('modal-task-desc');
  DOM.modalClose = document.getElementById('modal-close');
  DOM.modalCloseBtn = document.getElementById('modal-close-btn');
  DOM.modalCompleteBtn = document.getElementById('modal-complete-btn');
}

/* Animaciones iniciales */
function setupInitialAnimations() {
  if (DOM.titulo) {
    DOM.titulo.classList.add('fade-in');
    setTimeout(() => DOM.titulo.classList.add('show'), 100);
  }
  if (DOM.clockContainer) setTimeout(() => DOM.clockContainer.classList.add('show'), 500);
  if (DOM.tableWrapper) setTimeout(() => DOM.tableWrapper.classList.add('show'), 1000);
}

/* Eventos UI */
function bindUIEvents() {
  if (DOM.nextDayBtn) DOM.nextDayBtn.addEventListener('click', () => {
    animateDayChange('left', () => {
      state.currentDayIndex = (state.currentDayIndex + 1) % 7;
      renderForCurrentState();
      if (DOM.tableWrapper) DOM.tableWrapper.scrollTop = 0;
    });
  });

  if (DOM.todayBtn) DOM.todayBtn.addEventListener('click', () => {
    animateDayChange('right', () => {
      state.currentDayIndex = new Date().getDay();
      renderForCurrentState();
      if (DOM.tableWrapper) DOM.tableWrapper.scrollTop = 0;
    });
  });

  if (DOM.prevEmpBtn) DOM.prevEmpBtn.addEventListener('click', () => {
    if (state.currentEmpPage > 0) {
      animateEmpPageChange('right', () => {
        state.currentEmpPage--;
        renderForCurrentState();
        if (DOM.tableWrapper) DOM.tableWrapper.scrollTop = 0;
      });
    }
  });

  if (DOM.nextEmpBtn) DOM.nextEmpBtn.addEventListener('click', () => {
    const maxPage = Math.max(0, Math.ceil(state.trabajadores.length / state.pageSize) - 1);
    if (state.currentEmpPage < maxPage) {
      animateEmpPageChange('left', () => {
        state.currentEmpPage++;
        renderForCurrentState();
        if (DOM.tableWrapper) DOM.tableWrapper.scrollTop = 0;
      });
    }
  });

  // 🔹 Eventos modal
  if (DOM.modalClose) DOM.modalClose.addEventListener('click', closeModal);
  if (DOM.modalCloseBtn) DOM.modalCloseBtn.addEventListener('click', closeModal);
  if (DOM.modalCompleteBtn) DOM.modalCompleteBtn.addEventListener('click', () => {
    alert('✅ Tarea marcada como completada');
    closeModal();
  });
}

/* Render principal */
function renderForCurrentState() {
  const dayName = diasSemana[state.currentDayIndex];
  if (DOM.tasksDayLabel) DOM.tasksDayLabel.textContent = dayName.toUpperCase();

  DOM.theadRow.innerHTML = '';
  DOM.tbody.innerHTML = '';

  const startIndex = state.currentEmpPage * state.pageSize;
  const visibleTrabajadores = state.trabajadores.slice(startIndex, startIndex + state.pageSize);
  buildHeader(visibleTrabajadores);

  const actividades = collectActivitiesForDay(dayName);
  const rowsData = actividades.sort((a, b) => compareHour(a.hora, b.hora) || a.nombre.localeCompare(b.nombre));
  state.lastRowsData = rowsData;

  buildRows(rowsData, visibleTrabajadores);
  mergeCells(0);           // fusiona la columna "Horario"
  updateClockVisibility(); // hora/min/seg solo en hoy

  centerOnCurrentTime({ forceScroll: true }); // centrado automático
  adjustCenterBandHeight(); // ajusta sticky

  const maxPage = Math.max(0, Math.ceil(state.trabajadores.length / state.pageSize) - 1);
  if (DOM.prevEmpBtn) DOM.prevEmpBtn.disabled = (state.currentEmpPage <= 0);
  if (DOM.nextEmpBtn) DOM.nextEmpBtn.disabled = (state.currentEmpPage >= maxPage);
}

/* Encabezado */
function buildHeader(visible) {
  const frag = document.createDocumentFragment();

  const horarioTh  = document.createElement('th'); horarioTh.innerText = 'Horario'; horarioTh.setAttribute('scope','col'); frag.appendChild(horarioTh);
  const actividadTh= document.createElement('th'); actividadTh.innerText = 'Actividad'; actividadTh.setAttribute('scope','col'); frag.appendChild(actividadTh);

  // 🔹 Nueva columna Puntos
  const puntosTh = document.createElement('th');
  puntosTh.innerText = 'Puntos';
  puntosTh.setAttribute('scope','col');
  frag.appendChild(puntosTh);

  visible.forEach(trab => {
    const th = document.createElement('th');
    th.setAttribute('scope','col');

    const container = document.createElement('div');
    container.className = 'worker-header';

    const img = document.createElement('img');
    img.src = `/web/images/${trab.imagen || ''}`;
    img.alt = trab.nombre || '';
    img.onerror = function () {
      this.onerror = null;
      this.src = '/web/images/placeholder-user.png';
    };
    container.appendChild(img);

    const text = document.createElement('div');
    text.className = 'worker-text';
    const name = document.createElement('span'); name.className = 'worker-name'; name.innerText = trab.nombre || '';
    const role = document.createElement('span'); role.className = 'worker-role'; role.innerText = trab.puesto || '';
    text.appendChild(name); text.appendChild(role);
    container.appendChild(text);

    th.appendChild(container);
    frag.appendChild(th);
  });

  for (let i = visible.length; i < state.pageSize; i++) {
    const thEmpty = document.createElement('th');
    thEmpty.setAttribute('scope','col');
    thEmpty.innerText = '';
    frag.appendChild(thEmpty);
  }

  DOM.theadRow.appendChild(frag);
}

/* Recolecta actividades */
function collectActivitiesForDay(dayName) {
  const map = new Map();
  state.trabajadores.forEach(trab => {
    const tareas = (trab.tareas_asignadas && trab.tareas_asignadas[dayName]) || [];
    tareas.forEach(t => {
      const horaKey = t.hora || '--:--';
      const nombreKey = t.nombre || '(Sin nombre)';
      const key = `${horaKey}__${nombreKey}`;
      if (!map.has(key)) {
        map.set(key, { nombre: nombreKey, descripcion: t.descripcion || '', hora: t.hora || '' });
      }
    });
  });
  return Array.from(map.values());
}

/* Construye filas */
function buildRows(rowsData, visibleTrabajadores) {
  const frag = document.createDocumentFragment();
  const dayName = diasSemana[state.currentDayIndex];
  const isToday = state.currentDayIndex === new Date().getDay();

  rowsData.forEach(rowData => {
    const tr = document.createElement('tr');

    // Columna: horario
    const horarioCell = document.createElement('td');
    horarioCell.innerText = rowData.hora ? `${rowData.hora} hrs` : '-';
    tr.appendChild(horarioCell);

    // Columna: actividad
    const actividadCell = document.createElement('td');
    actividadCell.style.verticalAlign = 'top';
    actividadCell.style.textAlign = 'left';
    const nombreDiv = document.createElement('div'); nombreDiv.className = 'activity-name'; nombreDiv.innerText = rowData.nombre;
    const descDiv   = document.createElement('div'); descDiv.className   = 'activity-desc';  descDiv.innerText   = rowData.descripcion || '';
    actividadCell.appendChild(nombreDiv); actividadCell.appendChild(descDiv);
    tr.appendChild(actividadCell);

    // 🔹 Columna puntos (vacía)
    const puntosCell = document.createElement('td');
    puntosCell.innerText = '';
    tr.appendChild(puntosCell);

    // Columnas empleados
    visibleTrabajadores.forEach(trab => {
      const td = document.createElement('td');
      const tareas = (trab.tareas_asignadas && trab.tareas_asignadas[dayName]) || [];
      const tarea = tareas.find(t => (t.nombre || '') === rowData.nombre && (t.hora || '') === (rowData.hora || ''));
      if (tarea) {
        td.className = getStatusClass(tarea.estatus, tarea.hora, isToday);
        td.innerText = '-'; // Por defecto mostramos "-", se actualizará a "click" solo si es la fila actual
        td.dataset.hasTask = 'true'; // Marcamos que tiene tarea

        td.addEventListener("click", () => {
          const parentRow = td.closest("tr");
          if (parentRow && parentRow.classList.contains("current-row")) {
            td.style.cursor = "pointer";
            openModal(tarea);
          }
        });
      } else {
        td.innerText = '-';
      }

      tr.appendChild(td);
    });

    for (let i = visibleTrabajadores.length; i < state.pageSize; i++) {
      const tdEmpty = document.createElement('td');
      tdEmpty.innerText = '';
      tr.appendChild(tdEmpty);
    }

    frag.appendChild(tr);
  });

  DOM.tbody.appendChild(frag);
}

/* Modal funciones */
function openModal(tarea) {
  DOM.modalTaskName.textContent = tarea.nombre || 'Tarea sin nombre';
  DOM.modalTaskDesc.textContent = tarea.descripcion || 'Sin descripción disponible';
  DOM.modal.classList.remove('hidden');
}
function closeModal() {
  DOM.modal.classList.add('hidden');
}

/* Fusionar celdas */
function mergeCells(columnIndex) {
  const rows = Array.from(DOM.tbody.rows);
  if (!rows.length) return;
  let prevCell = null;
  let spanCount = 1;
  for (let i = 0; i < rows.length; i++) {
    const cell = rows[i].cells[columnIndex];
    if (!cell) continue;
    const text = cell.innerText;
    if (prevCell && prevCell.innerText === text) {
      spanCount++;
      prevCell.rowSpan = spanCount;
      cell.remove();
    } else {
      prevCell = cell;
      spanCount = 1;
    }
  }
}

/* Comparador de horas */
function compareHour(h1 = '', h2 = '') {
  if (!h1 && !h2) return 0;
  if (!h1) return 1;
  if (!h2) return -1;
  const [H1, M1 = '0'] = h1.split(':');
  const [H2, M2 = '0'] = h2.split(':');
  const a = (parseInt(H1, 10) || 0) * 60 + (parseInt(M1, 10) || 0);
  const b = (parseInt(H2, 10) || 0) * 60 + (parseInt(M2, 10) || 0);
  return a - b;
}

/* Clase según estatus */
function getStatusClass(estatus, hora, isToday) {
  if (isToday && hora) {
    const now = new Date();
    const [H = '0', M = '0'] = (hora || '').split(':');
    const taskDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(H, 10) || 0, parseInt(M, 10) || 0);
    if (taskDate < now && estatus !== 0 && estatus !== 4) {
      return 'status-overdue';
    }
  }
  switch (estatus) {
    case 0: return 'status-done';
    case 4: return 'status-done';
    case 3: return 'status-extras';
    case 1: return 'status-inprogress';
    case 2: return 'status-todo';
    default: return '';
  }
}

/* Centrado en hora actual */
function centerOnCurrentTime({ forceScroll = false } = {}) {
  const isToday = state.currentDayIndex === new Date().getDay();
  const rows = Array.from(DOM.tbody?.rows || []);
  if (!rows.length) return;

  // Reset all rows and task cells
  rows.forEach(r => {
    r.classList.remove('current-row');
    // Reset all task cells to show "-"
    r.querySelectorAll('td[data-has-task="true"]').forEach(cell => {
      cell.innerText = '-';
    });
  });

  let targetIndex = 0;
  if (isToday) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    let currentIdx = -1;
    state.lastRowsData.forEach((row, idx) => {
      const mins = hourToMinutes(row.hora);
      if (!isNaN(mins) && mins <= nowMin) {
        currentIdx = idx;
      }
    });
    targetIndex = currentIdx >= 0 ? currentIdx : 0;
    const currentHour = now.getHours();
    if (!forceScroll && state.lastHourScrolled === currentHour) {
      rows[targetIndex]?.classList.add('current-row');
      // Update task cells in current row to show "click"
      rows[targetIndex]?.querySelectorAll('td[data-has-task="true"]').forEach(cell => {
        cell.innerText = 'click';
      });
      state.lastTargetIndex = targetIndex;
      return;
    }
    state.lastHourScrolled = currentHour;
  }
  
  const targetRow = rows[targetIndex];
  if (!targetRow) return;
  
  targetRow.classList.add('current-row');
  // Update task cells in current row to show "click"
  targetRow.querySelectorAll('td[data-has-task="true"]').forEach(cell => {
    cell.innerText = 'click';
  });
  
  state.lastTargetIndex = targetIndex;
  scrollRowToCenter(targetRow);
}

function hourToMinutes(hora = '') {
  if (!hora) return NaN;
  const [H, M = '0'] = hora.split(':');
  const h = parseInt(H, 10); const m = parseInt(M, 10);
  if (isNaN(h) || isNaN(m)) return NaN;
  return h * 60 + m;
}

function scrollRowToCenter(rowEl) {
  if (!DOM.tableWrapper || !rowEl) return;
  const headerHeight = DOM.workerTable.tHead ? DOM.workerTable.tHead.offsetHeight : 0;
  const rowTop = rowEl.offsetTop - headerHeight;
  const rowHeight = rowEl.offsetHeight;
  const wrapperHeight = DOM.tableWrapper.clientHeight;
  const center = wrapperHeight / 2;
  const desired = Math.max(0, rowTop - (center - rowHeight / 2));
  DOM.tableWrapper.scrollTo({ top: desired, behavior: "smooth" });
}

/* Ajustar altura banda sticky */
function adjustCenterBandHeight() {
  if (!DOM.centerBand) return;
  const rows = Array.from(DOM.tbody?.rows || []);
  const target = rows[state.lastTargetIndex] || rows[0];
  const h = target ? target.offsetHeight : 48;
  DOM.centerBand.style.setProperty('--row-height', `${h}px`);
}

/* Clock */
function updateClockVisibility() {
  const realClockCols = document.querySelectorAll('.clock-col-real');
  const isToday = (state.currentDayIndex === new Date().getDay());
  realClockCols.forEach(col => col.classList.toggle('hidden', !isToday));
  if (DOM.todayBtn) DOM.todayBtn.classList.toggle('hidden', isToday);
}

function animateEmpPageChange(direction, onComplete) {
  const exitClass = direction === 'left' ? 'slide-left-exit' : 'slide-right-exit';
  const enterClass = direction === 'left' ? 'slide-left-enter' : 'slide-right-enter';
  runTransition(DOM.tableWrapper, exitClass, enterClass, onComplete);
}

function animateDayChange(direction, onComplete) {
  const exitClass = direction === 'left' ? 'slide-left-exit' : 'slide-right-exit';
  const enterClass = direction === 'left' ? 'slide-left-enter' : 'slide-right-enter';
  runTransitionMultiple([DOM.tableWrapper, DOM.tasksDayLabel], exitClass, enterClass, onComplete);
}

function runTransition(el, exitClass, enterClass, onComplete) {
  if (!el) return onComplete && onComplete();
  el.classList.add(exitClass);
  const onEnd = () => {
    el.classList.remove(exitClass);
    el.removeEventListener('animationend', onEnd);
    onComplete && onComplete();
    el.classList.add(enterClass);
    const onEndEnter = () => { el.classList.remove(enterClass); el.removeEventListener('animationend', onEndEnter); };
    el.addEventListener('animationend', onEndEnter);
  };
  el.addEventListener('animationend', onEnd);
}

function runTransitionMultiple(elements, exitClass, enterClass, onComplete) {
  const els = elements.filter(Boolean);
  if (!els.length) return onComplete && onComplete();
  let exited = 0;
  const needed = els.length;
  els.forEach(el => {
    const onEnd = () => {
      el.classList.remove(exitClass);
      el.removeEventListener('animationend', onEnd);
      exited++;
      if (exited === needed) {
        onComplete && onComplete();
        els.forEach(e2 => {
          const onEnterEnd = () => { e2.classList.remove(enterClass); e2.removeEventListener('animationend', onEnterEnd); };
          e2.classList.add(enterClass);
          e2.addEventListener('animationend', onEnterEnd);
        });
      }
    };
    el.classList.add(exitClass);
    el.addEventListener('animationend', onEnd);
  });
}

function startClock() {
  updateTime();
  if (clockIntervalId) clearInterval(clockIntervalId);
  clockIntervalId = setInterval(updateTime, 1000);
}

function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const dayName = diasSemana[now.getDay()].toUpperCase();
  document.documentElement.style.setProperty('--timer-hours', `"${hours}"`);
  document.documentElement.style.setProperty('--timer-minutes', `"${minutes}"`);
  document.documentElement.style.setProperty('--timer-seconds', `"${seconds}"`);
  document.documentElement.style.setProperty('--timer-day', `"${dayName}"`);
  if (state.currentDayIndex === now.getDay()) {
    const thisHour = now.getHours();
    if (state.lastHourScrolled !== thisHour) {
      centerOnCurrentTime({ forceScroll: true });
      adjustCenterBandHeight();
    }
  }
}
