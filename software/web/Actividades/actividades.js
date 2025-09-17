// General - Tabla de actividades por día/empleado + KPI + menú contextual por celda
import {abrirFormularioCrearTarea} from "../Gestion/Editar Empleado/Crear tareas/crear_tarea.js"

const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

const state = {
  currentDayIndex: new Date().getDay(),
  trabajadores: [],
  currentEmpPage: 0,
  pageSize: 8, // 8 empleados visibles + 3 fijas (Horario, Actividad, Puntos)
  lastRowsData: [],
  lastMinuteScrolled: null,
  lastTargetIndex: 0,
  activitiesByDay: new Map() // memo de actividades únicas por día
};

const DOM = {};
let clockIntervalId = null;

// Contexto del menú contextual
let menuContext = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  cacheSelectors();
  setupInitialAnimations();
  bindUIEvents();

  try {
    const resp = await fetch('/empleados.json');
    if (!resp.ok) throw new Error('Error al obtener los empleados');
    state.trabajadores = await resp.json();
    buildActivitiesCache();
  } catch (err) {
    console.error('Error al cargar empleados:', err);
    state.trabajadores = [];
    state.activitiesByDay.clear();
  }

  renderForCurrentState();
  startClock();

  // resize throttled
  window.addEventListener('resize', rafThrottle(adjustCenterBandHeight));
}

/* Cacheo de selectores */
function cacheSelectors() {
  DOM.titulo = document.querySelector('h2');
  DOM.clockContainer = document.querySelector('.clock-container');
  DOM.tableWrapper = document.getElementById('table-wrapper');
  DOM.centerBand = document.querySelector('.sticky-center-band'); // puede no existir
  DOM.nextDayBtn = document.getElementById('next-day-btn');
  DOM.todayBtn = document.getElementById('today-btn');
  DOM.prevEmpBtn = document.getElementById('prev-emp-page');
  DOM.nextEmpBtn = document.getElementById('next-emp-page');
  DOM.tasksDayLabel = document.getElementById('tasks-day');
  DOM.workerTable = document.getElementById('worker-table');
  DOM.tbody = DOM.workerTable?.querySelector('tbody');
  DOM.theadRow = DOM.workerTable?.querySelector('thead tr');
  DOM.realClockCols = document.querySelectorAll('.clock-col-real');

  // Widget KPI (si está presente)
  DOM.taskProgress = document.getElementById('task-progress');

  // Modal info
  DOM.modal = document.getElementById('task-modal');
  DOM.modalTaskName = document.getElementById('modal-task-name');
  DOM.modalTaskDesc = document.getElementById('modal-task-desc');
  DOM.modalClose = document.getElementById('modal-close');
  DOM.modalCloseBtn = document.getElementById('modal-close-btn');
  DOM.modalCompleteBtn = document.getElementById('modal-complete-btn');

  // Modal para acciones sobre trabajador (crear/editar/info)
  DOM.createTaskModal = document.getElementById('modal-create-task');

  // Menú contextual
  DOM.cellMenu = document.getElementById('cell-menu');
    // Menú contextual (empleado)
  DOM.profileMenu = document.getElementById('profile-menu');

}

/* Animaciones iniciales */
function setupInitialAnimations() {
  if (DOM.titulo) {
    DOM.titulo.classList.add('fade-in');
    setTimeout(() => DOM.titulo.classList.add('show'), 100);
  }
  if (DOM.clockContainer) setTimeout(() => DOM.clockContainer.classList.add('show'), 500);
  if (DOM.taskProgress) setTimeout(() => DOM.taskProgress.classList.add('show'), 700);
  if (DOM.tableWrapper) setTimeout(() => DOM.tableWrapper.classList.add('show'), 1000);
}

/* Eventos UI */
function bindUIEvents() {
  // 👉 Botón siguiente día
  DOM.nextDayBtn?.addEventListener('click', () => {
    animateDayChange('left', () => {
      state.currentDayIndex = (state.currentDayIndex + 1) % 7;
      renderForCurrentState();
      DOM.tableWrapper.scrollTop = 0;
    });
  });

  // 👉 Botón ir a hoy
  DOM.todayBtn?.addEventListener('click', () => {
    animateDayChange('right', () => {
      state.currentDayIndex = new Date().getDay();
      renderForCurrentState();
      DOM.tableWrapper.scrollTop = 0;
    });
  });

  // 👉 Botón empleados previos
  DOM.prevEmpBtn?.addEventListener('click', () => {
    if (state.currentEmpPage > 0) {
      animateEmpPageChange('right', () => {
        state.currentEmpPage--;
        renderForCurrentState();
        DOM.tableWrapper.scrollTop = 0;
      });
    }
  });

  // 👉 Botón empleados siguientes
  DOM.nextEmpBtn?.addEventListener('click', () => {
    if (state.currentEmpPage < getMaxPage()) {
      animateEmpPageChange('left', () => {
        state.currentEmpPage++;
        renderForCurrentState();
        DOM.tableWrapper.scrollTop = 0;
      });
    }
  });

  // 👉 Click en celdas → cell-menu
  DOM.tbody?.addEventListener('click', (e) => {
    const td = e.target.closest('td');
    if (!td || td.cellIndex < 3) return;
    e.stopPropagation();
    showCellMenu(e, td);
  });

  // 👉 Click en encabezados → profile-menu
  DOM.theadRow?.addEventListener('click', (e) => {
    const th = e.target.closest('th');
    if (!th || th.cellIndex < 3) return;

    const idx = state.currentEmpPage * state.pageSize + (th.cellIndex - 3);
    const trabajador = state.trabajadores[idx];
    if (!trabajador) return;

    // Evitar que el click burbujee al document y cierre el modal inmediatamente
    e.stopPropagation();
    // Guardar contexto y abrir modal centrado con opciones (crear/editar/info)
    menuContext = { empId: trabajador.id, empName: trabajador.nombre };
    showWorkerModal(trabajador);
  });

  // 👉 Clicks fuera / scroll / resize / ESC → cerrar menús
  document.addEventListener('click', (e) => {
    if (DOM.cellMenu && !DOM.cellMenu.classList.contains('hidden') && !DOM.cellMenu.contains(e.target)) hideCellMenu();
    if (DOM.profileMenu && !DOM.profileMenu.classList.contains('pm-hidden') && !DOM.profileMenu.contains(e.target)) hideProfileMenu();
    // Cerrar modal de trabajador si se hace click fuera
    if (DOM.createTaskModal && !DOM.createTaskModal.classList.contains('hidden') && !DOM.createTaskModal.contains(e.target)) hideWorkerModal();
  });
  DOM.tableWrapper?.addEventListener('scroll', () => { hideCellMenu(); hideProfileMenu(); });
  window.addEventListener('resize', () => { hideCellMenu(); hideProfileMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { hideCellMenu(); hideProfileMenu(); } });

  // Cerrar worker modal con Escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideWorkerModal(); });

  // 👉 Acciones cell-menu
  DOM.cellMenu?.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-item');
    if (btn) handleCellMenuAction(btn.dataset.action);
  });

  // 👉 Acciones profile-menu
  document.querySelectorAll('#profile-menu .menu-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!menuContext) return;
      switch (btn.dataset.action) {
        case 'emp-info':
          alert(`ℹ️ Info: ${menuContext.empName} (ID: ${menuContext.empId})`);
          break;
        case 'emp-create':
          abrirFormularioCrearTarea(menuContext.empId, menuContext.empName);
          break;
        case 'emp-edit':
          alert(`✏️ Editar: ${menuContext.empName}`);
          break;
      }
      hideProfileMenu();
    });
  });

  // 👉 Modal de tarea
  DOM.modalClose?.addEventListener('click', closeModal);
  DOM.modalCloseBtn?.addEventListener('click', closeModal);
  DOM.modalCompleteBtn?.addEventListener('click', () => { console.log('✅ Completada'); closeModal(); });
}

/* Helpers profile-menu */
function showProfileMenu(x, y) {
  if (!DOM.profileMenu) return;
  DOM.profileMenu.style.left = `${x}px`;
  DOM.profileMenu.style.top = `${y}px`;
  DOM.profileMenu.classList.remove('pm-hidden');
  DOM.profileMenu.classList.add('show');
}
function hideProfileMenu() {
  if (!DOM.profileMenu) return;
  DOM.profileMenu.classList.add('pm-hidden');
  DOM.profileMenu.classList.remove('show');
}

// Mostrar modal con opciones al hacer click en el header del trabajador
function showWorkerModal(trabajador) {
  const modal = DOM.createTaskModal;
  if (!modal) {
    // fallback a profile menu si el modal no existe
    alert(`Opciones para ${trabajador.nombre}: Crear / Editar / Info`);
    return;
  }

  // Vaciar y construir contenido simple dentro del modal
  modal.innerHTML = '';
  modal.classList.remove('hidden');

  const wrapper = document.createElement('div');
  wrapper.className = 'modal-content';
  // Evitar que clicks dentro del modal cierren el modal por el listener global
  wrapper.addEventListener('click', (ev) => ev.stopPropagation());

  const title = document.createElement('h3');
  title.textContent = `Opciones: ${trabajador.nombre}`;
  wrapper.appendChild(title);

  const btnCrear = document.createElement('button');
  btnCrear.type = 'button';
  btnCrear.textContent = 'Crear Tarea';
  btnCrear.className = 'menu-item';
  btnCrear.addEventListener('click', () => {
    // Reusar handler existente para crear tarea. Si la referencia no existe
    // tratamos de cargar el módulo dinámicamente (más tolerante a rutas)
    (async () => {
      console.log('Crear Tarea clicked. abrirFormularioCrearTarea typeof =', typeof abrirFormularioCrearTarea);
      try {
        if (typeof abrirFormularioCrearTarea === 'function') {
          abrirFormularioCrearTarea(trabajador.id, trabajador.nombre);
          return;
        }
        // Intentar import dinámico como fallback
        const mod = await import('../Gestion/Editar Empleado/Crear tareas/crear_tarea.js');
        const fn = mod.abrirFormularioCrearTarea || mod.default;
        if (typeof fn === 'function') {
          fn(trabajador.id, trabajador.nombre);
        } else {
          console.error('Módulo cargado pero no contiene abrirFormularioCrearTarea', mod);
          alert('No se encontró la función abrirFormularioCrearTarea en el módulo importado.');
        }
      } catch (err) {
        console.error('Error al invocar abrirFormularioCrearTarea:', err);
        alert('Error al abrir el formulario de creación de tarea:\n' + (err && err.message ? err.message : String(err)));
      }
    })();
  });
  wrapper.appendChild(btnCrear);

  const btnEditar = document.createElement('button');
  btnEditar.type = 'button';
  btnEditar.textContent = 'Editar Trabajador';
  btnEditar.className = 'menu-item';
  btnEditar.addEventListener('click', () => {
    alert(`Editar: ${trabajador.nombre} (ID: ${trabajador.id})`);
    hideWorkerModal();
  });
  wrapper.appendChild(btnEditar);

  const btnInfo = document.createElement('button');
  btnInfo.type = 'button';
  btnInfo.textContent = 'Información';
  btnInfo.className = 'menu-item';
  btnInfo.addEventListener('click', () => {
    alert(`ℹ️ Información de ${trabajador.nombre}`);
    hideWorkerModal();
  });
  wrapper.appendChild(btnInfo);

  // Botón cerrar
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = 'Cerrar';
  closeBtn.className = 'menu-item';
  closeBtn.addEventListener('click', hideWorkerModal);
  wrapper.appendChild(closeBtn);

  modal.appendChild(wrapper);
}

function hideWorkerModal() {
  const modal = DOM.createTaskModal;
  if (!modal) return;
  modal.classList.add('hidden');
  modal.innerHTML = '';
}




/* Render principal */
function renderForCurrentState() {
  const dayName = diasSemana[state.currentDayIndex];
  if (DOM.tasksDayLabel) DOM.tasksDayLabel.textContent = dayName.toUpperCase();

  if (!DOM.theadRow || !DOM.tbody) return;
  DOM.theadRow.textContent = '';
  DOM.tbody.textContent = '';

  const startIndex = state.currentEmpPage * state.pageSize;
  const visibleTrabajadores = state.trabajadores.slice(startIndex, startIndex + state.pageSize);
  buildHeader(visibleTrabajadores);

  const actividades = collectActivitiesForDay(dayName);
  const rowsData = actividades.sort((a, b) => compareHour(a.hora, b.hora) || a.nombre.localeCompare(b.nombre));
  state.lastRowsData = rowsData;

  // Reutilizamos un solo "now"
  const now = new Date();
  const isToday = state.currentDayIndex === now.getDay();
  buildRows(rowsData, visibleTrabajadores, isToday, now);
  mergeCells(0);
  updateClockVisibility();

  centerOnCurrentTime({ forceScroll: true, now });
  adjustCenterBandHeight();

  // KPI
  updateTaskProgressWidget();

  // Paginación
  if (DOM.prevEmpBtn) DOM.prevEmpBtn.disabled = (state.currentEmpPage <= 0);
  if (DOM.nextEmpBtn) DOM.nextEmpBtn.disabled = (state.currentEmpPage >= getMaxPage());
}

/* Encabezado */
function buildHeader(visible) {
  const frag = document.createDocumentFragment();

  const thHorario = document.createElement('th');
  thHorario.textContent = 'Horario';
  thHorario.setAttribute('scope', 'col');
  frag.appendChild(thHorario);

  const thActividad = document.createElement('th');
  thActividad.textContent = 'Actividad';
  thActividad.setAttribute('scope', 'col');
  frag.appendChild(thActividad);

  const thPuntos = document.createElement('th');
  thPuntos.textContent = 'Puntos';
  thPuntos.setAttribute('scope', 'col');
  frag.appendChild(thPuntos);

  visible.forEach(trab => {
    const th = document.createElement('th');
    th.setAttribute('scope', 'col');

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
    const name = document.createElement('span'); name.className = 'worker-name'; name.textContent = trab.nombre || '';
    const role = document.createElement('span'); role.className = 'worker-role'; role.textContent = trab.puesto || '';
    text.appendChild(name); text.appendChild(role);
    container.appendChild(text);

    th.appendChild(container);
    frag.appendChild(th);
  });

  // relleno de columnas si hay menos que pageSize
  for (let i = visible.length; i < state.pageSize; i++) {
    const thEmpty = document.createElement('th');
    thEmpty.setAttribute('scope', 'col');
    thEmpty.textContent = '';
    frag.appendChild(thEmpty);
  }

  DOM.theadRow.appendChild(frag);
}

/* Memo: actividades únicas por día (precalculo) */
function buildActivitiesCache() {
  state.activitiesByDay.clear();
  for (const d of diasSemana) {
    const map = new Map();
    for (const trab of state.trabajadores) {
      const tareas = (trab.tareas_asignadas && trab.tareas_asignadas[d]) || [];
      for (const t of tareas) {
        const horaKey = t.hora || '--:--';
        const nombreKey = t.nombre || '(Sin nombre)';
        const key = `${horaKey}__${nombreKey}`;
        if (!map.has(key)) {
          map.set(key, { nombre: nombreKey, descripcion: t.descripcion || '', hora: t.hora || '' });
        }
      }
    }
    state.activitiesByDay.set(d, Array.from(map.values()));
  }
}

/* Recolecta actividades con memo */
function collectActivitiesForDay(dayName) {
  if (state.activitiesByDay.has(dayName)) return state.activitiesByDay.get(dayName) || [];
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
  const arr = Array.from(map.values());
  state.activitiesByDay.set(dayName, arr);
  return arr;
}

/* Construye filas */
function buildRows(rowsData, visibleTrabajadores, isToday, now) {
  const frag = document.createDocumentFragment();
  const dayName = diasSemana[state.currentDayIndex];

  rowsData.forEach(rowData => {
    const tr = document.createElement('tr');

    // Columna: horario
    const horarioCell = document.createElement('td');
    horarioCell.textContent = rowData.hora ? `${rowData.hora} hrs` : '-';
    tr.appendChild(horarioCell);

    // Columna: actividad
    const actividadCell = document.createElement('td');
    actividadCell.style.verticalAlign = 'top';
    actividadCell.style.textAlign = 'left';
    const nombreDiv = document.createElement('div'); nombreDiv.className = 'activity-name'; nombreDiv.textContent = rowData.nombre;
    const descDiv   = document.createElement('div'); descDiv.className   = 'activity-desc';  descDiv.textContent   = rowData.descripcion || '';
    actividadCell.appendChild(nombreDiv); actividadCell.appendChild(descDiv);
    tr.appendChild(actividadCell);

    // Columna puntos (reservada)
    const puntosCell = document.createElement('td');
    puntosCell.textContent = '';
    tr.appendChild(puntosCell);

    // Columnas empleados
    visibleTrabajadores.forEach(trab => {
      const td = document.createElement('td');

      // Datos de contexto SIEMPRE (aunque no haya tarea)
      td.dataset.empId   = String(trab.id ?? '');
      td.dataset.empName = trab.nombre || '';
      td.dataset.hora    = rowData.hora || '';
      td.dataset.nombre  = rowData.nombre || '';

      const tareas = (trab.tareas_asignadas && trab.tareas_asignadas[dayName]) || [];
      const tarea = tareas.find(t => (t.nombre || '') === rowData.nombre && (t.hora || '') === (rowData.hora || ''));
      if (tarea) {
        td.className = getStatusClass(tarea.estatus, tarea.hora, isToday, now);
        td.textContent = '-';
        td.dataset.hasTask = 'true';
        td.dataset.desc = tarea.descripcion || '';
        td.dataset.estatus = String(tarea.estatus ?? '');
      } else {
        td.textContent = '-';
      }
      tr.appendChild(td);
    });

    // celdas de relleno si faltan empleados visibles
    for (let i = visibleTrabajadores.length; i < state.pageSize; i++) {
      const tdEmpty = document.createElement('td');
      tdEmpty.textContent = '';
      tr.appendChild(tdEmpty);
    }

    frag.appendChild(tr);
  });

  DOM.tbody.appendChild(frag);
}

/* ===== Menú contextual ===== */
function showCellMenu(evt, td) {
  if (!DOM.cellMenu) return;
  // Construir contexto de la celda
  menuContext = {
    empId: td.dataset.empId ? parseInt(td.dataset.empId, 10) : null,
    empName: td.dataset.empName || '',
    dia: diasSemana[state.currentDayIndex],
    hora: td.dataset.hora || '',
    actividad: td.dataset.nombre || '',
    tieneTarea: !!td.dataset.hasTask,
    estatus: td.dataset.estatus ? Number(td.dataset.estatus) : null,
    descripcion: td.dataset.desc || ''
  };

  // Posicionar cerca del click y dentro del viewport
  const margin = 8;
  let x = evt.clientX + margin;
  let y = evt.clientY + margin;

  DOM.cellMenu.style.left = `${x}px`;
  DOM.cellMenu.style.top  = `${y}px`;
  DOM.cellMenu.classList.remove('hidden');
  DOM.cellMenu.setAttribute('aria-hidden', 'false');
}

function hideCellMenu() {
  if (!DOM.cellMenu) return;
  DOM.cellMenu.classList.add('hidden');
  DOM.cellMenu.setAttribute('aria-hidden', 'true');
  menuContext = null;
}

function handleCellMenuAction(action) {
  if (!menuContext) return;

  if (action === 'info') {
    if (menuContext.tieneTarea) {
      openModal({
        nombre: menuContext.actividad,
        descripcion: menuContext.descripcion,
        hora: menuContext.hora,
        estatus: menuContext.estatus
      });
    } else {
      alert('No hay una tarea asociada a esta celda.');
    }
  }

  if (action === 'create') {
    abrirFormularioCrearTarea(menuContext.empId, menuContext.empName);
  }

  if (action === 'edit') {
    if (menuContext.tieneTarea) {
      // Aquí podrías abrir tu propio modal de edición
      alert(`Editar tarea de ${menuContext.empName} — ${menuContext.dia} ${menuContext.hora} (${menuContext.actividad})`);
    } else {
      alert('No hay tarea que editar en esta celda.');
    }
  }

  hideCellMenu();
}

/* ===== Modal (información) ===== */
function openModal(tarea) {
  DOM.modalTaskName.textContent = tarea.nombre || 'Tarea sin nombre';
  DOM.modalTaskDesc.textContent = tarea.descripcion || 'Sin descripción disponible';
  DOM.modal.classList.remove('hidden');
}
function closeModal() { DOM.modal.classList.add('hidden'); }

/* Fusionar celdas */
function mergeCells(columnIndex) {
  const rows = Array.from(DOM.tbody.rows);
  if (!rows.length) return;
  let prevCell = null;
  let spanCount = 1;
  for (let i = 0; i < rows.length; i++) {
    const cell = rows[i].cells[columnIndex];
    if (!cell) continue;
    const text = cell.textContent;
    if (prevCell && prevCell.textContent === text) {
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
function getStatusClass(estatus, hora, isToday, now) {
  if (isToday && hora) {
    const [H = '0', M = '0'] = (hora || '').split(':');
    const taskDate = new Date(
      now.getFullYear(), now.getMonth(), now.getDate(),
      parseInt(H, 10) || 0, parseInt(M, 10) || 0
    );
    if (taskDate < now && estatus !== 0 && estatus !== 4) {
      return 'status-overdue';
    }
  }
  switch (estatus) {
    case 0:
    case 4: return 'status-done';
    case 3: return 'status-extras';
    case 1: return 'status-inprogress';
    case 2: return 'status-todo';
    default: return '';
  }
}

/* Centrado en hora actual */
function centerOnCurrentTime({ forceScroll = false, now = new Date() } = {}) {
  const isToday = state.currentDayIndex === now.getDay();
  const rows = Array.from(DOM.tbody?.rows || []);
  if (!rows.length) return;

  // Reset filas/celdas
  rows.forEach(r => {
    r.classList.remove('current-row');
    r.querySelectorAll('td[data-has-task="true"]').forEach(cell => {
      cell.textContent = '-';
    });
  });

  let targetIndex = 0;
  if (isToday) {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    let currentIdx = -1;
    state.lastRowsData.forEach((row, idx) => {
      const mins = hourToMinutes(row.hora);
      if (!isNaN(mins) && mins <= nowMin) currentIdx = idx;
    });
    targetIndex = currentIdx >= 0 ? currentIdx : 0;

    if (!forceScroll && state.lastMinuteScrolled === now.getMinutes()) {
      rows[targetIndex]?.classList.add('current-row');
      rows[targetIndex]?.querySelectorAll('td[data-has-task="true"]').forEach(cell => {
        cell.textContent = 'click';
      });
      state.lastTargetIndex = targetIndex;
      return;
    }
    state.lastMinuteScrolled = now.getMinutes();
  }

  const targetRow = rows[targetIndex];
  if (!targetRow) return;

  targetRow.classList.add('current-row');
  targetRow.querySelectorAll('td[data-has-task="true"]').forEach(cell => {
    cell.textContent = 'click';
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
  const desired = Math.max(0, rowTop - ((wrapperHeight / 2) - (rowHeight / 2)));
  DOM.tableWrapper.scrollTo({ top: desired, behavior: "smooth" });
}

/* Ajustar altura banda sticky (si existe) */
function adjustCenterBandHeight() {
  if (!DOM.centerBand) return;
  const rows = Array.from(DOM.tbody?.rows || []);
  const target = rows[state.lastTargetIndex] || rows[0];
  const h = target ? target.offsetHeight : 48;
  DOM.centerBand.style.setProperty('--row-height', `${h}px`);
}

/* Clock */
function updateClockVisibility() {
  const isToday = (state.currentDayIndex === new Date().getDay());
  DOM.realClockCols.forEach(col => col.classList.toggle('hidden', !isToday));
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

  // Recentrar y refrescar KPI solo cuando cambia el minuto
  if (state.currentDayIndex === now.getDay() && state.lastMinuteScrolled !== now.getMinutes()) {
    centerOnCurrentTime({ forceScroll: true, now });
    adjustCenterBandHeight();
    updateTaskProgressWidget();
  }
}

/* Utils */
function getMaxPage() {
  return Math.max(0, Math.ceil(state.trabajadores.length / state.pageSize) - 1);
}

function rafThrottle(fn) {
  let scheduled = false;
  return (...args) => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        fn(...args);
      });
    }
  };
}

/* =========================================================
   KPI: Progreso de tareas (General)
   ========================================================= */
function updateTaskProgressWidget() {
  if (!DOM.taskProgress) return;

  const empleados = state.trabajadores || [];
  const countEl   = document.getElementById('chartCountG');
  const percentEl = document.getElementById('chartPercentG');
  const extrasEl  = document.getElementById('extrasCountG');

  if (!empleados.length) {
    if (countEl)   countEl.textContent = '0/0';
    if (percentEl) percentEl.textContent = '0%';
    if (extrasEl)  extrasEl.textContent = '0';
    return;
  }

  const loggedUserString = localStorage.getItem('loggedUser');
  const loggedUser = loggedUserString ? JSON.parse(loggedUserString) : { role: 'visitante' };

  let empleadosPara = empleados;
  if (loggedUser.role !== 'admin' && loggedUser.role !== 'visitante') {
    const empleadoId = parseInt(loggedUser.empleado_id);
    if (!isNaN(empleadoId)) {
      empleadosPara = empleados.filter(e => e.id === empleadoId);
    }
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const diaKey = diasSemana[state.currentDayIndex];

  const isExtra          = (t) => t && (t.estatus === 3 || t.estatus === 4);
  const isExtraTerminada = (t) => t && t.estatus === 4;

  let totalVencidas = 0;
  let totalCompletadas = 0;
  let totalExtrasTerminadas = 0;

  empleadosPara.forEach(emp => {
    const tareasHoy = emp?.tareas_asignadas?.[diaKey] || [];

    totalExtrasTerminadas += tareasHoy.reduce((acc, t) => acc + (isExtraTerminada(t) ? 1 : 0), 0);

    const tareasHorario = tareasHoy.filter(t => !isExtra(t));

    const ordenadas = tareasHorario
      .map(t => ({ ...t, minutos: hourToMinutes(t.hora) }))
      .sort((a, b) => a.minutos - b.minutos);

    const vencidas = ordenadas.filter(t => !isNaN(t.minutos) && t.minutos <= nowMinutes);

    totalVencidas += vencidas.length;
    totalCompletadas += vencidas.reduce((acc, t) => acc + (t.estatus === 0 ? 1 : 0), 0);
  });

  const C = 314; // circunferencia aprox r=50
  const pct = totalVencidas > 0 ? (totalCompletadas / totalVencidas) * 100 : 0;
  const seg = Math.max(0, Math.min(C, (pct / 100) * C));

  if (countEl)   countEl.textContent = `${totalCompletadas}/${totalVencidas}`;
  if (percentEl) percentEl.textContent = `${Math.round(pct)}%`;
  if (extrasEl)  extrasEl.textContent = String(totalExtrasTerminadas);

  const circleCompleted = DOM.taskProgress.querySelector('.progress-ring__circle.completed');
  const circleNot       = DOM.taskProgress.querySelector('.progress-ring__circle.not-completed');

  if (circleNot) {
    circleNot.style.strokeDasharray  = `${C} 0`;
    circleNot.style.strokeDashoffset = '0';
  }
  if (circleCompleted) {
    circleCompleted.style.strokeDasharray  = `${seg.toFixed(3)} ${(C - seg).toFixed(3)}`;
    circleCompleted.style.strokeDashoffset = '0';
  }
}
