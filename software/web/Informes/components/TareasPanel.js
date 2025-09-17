import { getAllTasks } from "../utils/index.js";

let tareasRealizadasMap = {};

export function setTareasRealizadasMap(map) {
  tareasRealizadasMap = map;
}

export function mostrarTareasEmpleado(empleado) {
  const calendarioContainer = document.getElementById("calendario-container");
  if (!calendarioContainer) return;

  calendarioContainer.style.display = "flex";
  calendarioContainer.innerHTML = "";
  calendarioContainer.classList.add("tasks-card");

  const headerDiv = document.createElement("div");
  headerDiv.classList.add("tasks-card-header");
    // Cabecera con bloque de cortes mensuales: título principal y debajo los dos cortes (quincenas)
    headerDiv.innerHTML = `
      <div class="tasks-header-top">
        <p>${empleado.nombre}</p>
      </div>
      <div class="quincenas-block" role="tablist" aria-label="Selector de corte mensual">
        <span class="quincena-label" id="corte-mes-label">Mes</span>
        <div class="quincenas-row">
          <button type="button" class="quincena-item" data-quincena="1" aria-pressed="true">Corte 1</button>
          <span class="quincena-sep" aria-hidden="true">|</span>
          <button type="button" class="quincena-item quincena-clickable" data-quincena="2">Corte 2</button>
        </div>
        <!-- Calendario quincenal (se renderiza dinámicamente) -->
        <div class="calendario-quincenal" aria-hidden="false"></div>
      </div>
    `;

  const bodyDiv = document.createElement("div");
  bodyDiv.classList.add("tasks-card-body");
  // Función para renderizar secciones de tareas dentro de bodyDiv
  const allTasks = getAllTasks(empleado);
  const realizadasBackup = tareasRealizadasMap[empleado.id] || [];
  const byHora = (a, b) => parseHora(a.hora) - parseHora(b.hora);

  function renderTaskSections(filterDayName = null) {
    // filterDayName: e.g. 'lunes' (lowercase) or null for mostrar todo
    bodyDiv.innerHTML = '';

    // Construir lista combinada de tareas (incluye backup para realizadas)
    const merged = [
      ...allTasks.filter(t => t.estatus === 0),
      ...realizadasBackup,
      ...allTasks.filter(t => t.estatus !== 0)
    ].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);

    // Si hay filtro por día, filtrar por el nombre del día (dia capitalizado en tareas)
    let tasksToUse = merged;
    if (filterDayName) {
      // Normalizamos ambos lados para soportar acentos y distintas capitalizaciones
      const normalizeDay = (str) => (str || '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      const target = normalizeDay(filterDayName);
      tasksToUse = merged.filter(t => normalizeDay(t.dia) === target);
    }

    // Particionar por estatus
    const tareasPend = tasksToUse.filter(t => t.estatus === 1).sort(byHora);
    const tareasPorHacer = tasksToUse.filter(t => t.estatus === 2).sort(byHora);
    const tareasReal = [
      ...tasksToUse.filter(t => t.estatus === 0),
      ...realizadasBackup.filter(r => (tasksToUse.some(tt => tt.id === r.id)))
    ].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i).sort(byHora);
    const tareasExtra = tasksToUse.filter(t => t.estatus === 3).sort(byHora);

    bodyDiv.appendChild(crearSeccionTareas("Tareas Pendientes",  tareasPend));
    bodyDiv.appendChild(crearSeccionTareas("Tareas por Realizar", tareasPorHacer));
    bodyDiv.appendChild(crearSeccionTareas("Tareas Realizadas",  tareasReal));
    bodyDiv.appendChild(crearSeccionTareas("Tareas Extras",      tareasExtra));

    // Llevar scroll al inicio
    bodyDiv.scrollTop = 0;
  }

  // Render inicial sin filtro (muestra todo)
  renderTaskSections(null);

  calendarioContainer.appendChild(headerDiv);
  calendarioContainer.appendChild(bodyDiv);

  // Añadir manejador para quincena clickeable (delegación)
  // Estado actual de quincena y día seleccionado
  // Por defecto seleccionamos la quincena que contiene el día actual
  const _today = new Date();
  let currentQuincena = (_today.getDate() >= 16) ? 2 : 1; // 1 o 2
  let diaSeleccionado = null; // índice 0..14

  const calendarioQuincenal = headerDiv.querySelector('.calendario-quincenal');

  // Helper para normalizar nombres de día (quita acentos y pasa a minúsculas)
  const normalizeDay = (str) => (str || '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  function renderCalendario(quincena = 1) {
    if (!calendarioQuincenal) return;
    calendarioQuincenal.innerHTML = '';
    const grid = document.createElement('div');
    grid.classList.add('calendario-grid');

    // Determinar mes/año de referencia (hoy)
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-based

    // Calcular día de corte según quincena
    let cutoffDay;
      if (quincena === 1) {
        // 3 días antes del día 15 => 12
        cutoffDay = Math.max(1, 15 - 3);
      } else {
        // 3 días antes del último día del mes
        const lastDay = new Date(year, month + 1, 0).getDate();
        cutoffDay = Math.max(1, lastDay - 3);
      }

    // Determinar último día del mes y calcular cortes
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const cutoff1 = Math.max(1, 15 - 3); // día 12
    const cutoff2 = Math.max(1, lastDayOfMonth - 3);

    // Generar fechas según quincena seleccionada:
    // Corte 1 -> primera quincena (días 1..15)
    // Corte 2 -> segunda quincena (días 16..lastDayOfMonth)
    const dates = [];
    if (quincena === 1) {
      const end = Math.min(15, lastDayOfMonth);
      for (let day = 1; day <= end; day++) dates.push(new Date(year, month, day));
    } else {
      const start = Math.min(16, lastDayOfMonth);
      for (let day = start; day <= lastDayOfMonth; day++) dates.push(new Date(year, month, day));
    }

    // Header con mes y rango (suprimido): actualizamos solo la etiqueta superior con mes/año
    const first = dates[0];
    const last = dates[dates.length - 1];
    const monthNames = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    // Actualizar etiqueta de bloque con mes y año actual (el mes/año ya aparece arriba)
    const labelEl = headerDiv.querySelector('#corte-mes-label');
    if (labelEl) {
      labelEl.textContent = `${monthNames[last.getMonth()].charAt(0).toUpperCase() + monthNames[last.getMonth()].slice(1)} ${last.getFullYear()}`;
    }

    // Generamos botones con número y abreviatura del día
    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      const diaBtn = document.createElement('button');
      diaBtn.type = 'button';
      diaBtn.classList.add('calendario-dia');
      diaBtn.setAttribute('data-dia-index', i.toString());
  diaBtn.setAttribute('data-date', d.toISOString().slice(0, 10));
  // Guardar nombre del día ya normalizado para evitar parsing ISO/UTC que
  // puede causar un desfase de día en ciertas zonas horarias
  const rawDay = d.toLocaleDateString('es-ES', { weekday: 'long' });
  diaBtn.setAttribute('data-dayname', normalizeDay(rawDay));
      diaBtn.setAttribute('aria-pressed', 'false');

      // Marcar el día actual
      const todayISO = new Date().toISOString().slice(0, 10);
      if (diaBtn.getAttribute('data-date') === todayISO) {
        diaBtn.classList.add('dia-hoy');
        diaBtn.setAttribute('aria-current', 'date');
      }

  // Marcar si este día es un día de corte (1 o 2)
  if (d.getDate() === cutoff1) diaBtn.setAttribute('data-cutoff', '1');
  if (d.getDate() === cutoff2) diaBtn.setAttribute('data-cutoff', '2');

      // Contenido con número grande y weekday pequeño
      const weekdayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
      const dayNum = document.createElement('span');
      dayNum.classList.add('dia-num');
      dayNum.textContent = String(d.getDate());

      const week = document.createElement('small');
      week.classList.add('dia-week');
      week.textContent = weekdayNames[d.getDay()];

      diaBtn.appendChild(dayNum);
      diaBtn.appendChild(week);
      grid.appendChild(diaBtn);
    }

    calendarioQuincenal.appendChild(grid);
  }

  // Ajustar estado aria-pressed en botones de quincena según quincena por defecto
  headerDiv.querySelectorAll('.quincena-item').forEach(el => {
    const q = parseInt(el.getAttribute('data-quincena'), 10) || 1;
    el.setAttribute('aria-pressed', q === currentQuincena ? 'true' : 'false');
  });

  // Inicial render
  renderCalendario(currentQuincena);

  // Auto-seleccionar el día actual dentro del calendario (si pertenece a la quincena mostrada)
  try {
    const todayISO = _today.toISOString().slice(0, 10);
    const todayBtn = headerDiv.querySelector(`.calendario-dia[data-date="${todayISO}"]`);
    if (todayBtn) {
      // limpiar selección previa
      headerDiv.querySelectorAll('.calendario-dia').forEach(el => {
        el.classList.remove('dia-selected');
        el.setAttribute('aria-pressed', 'false');
      });
      // marcar selección
      todayBtn.classList.add('dia-selected');
      todayBtn.setAttribute('aria-pressed', 'true');
      diaSeleccionado = parseInt(todayBtn.getAttribute('data-dia-index'), 10);

      // Emitir evento y filtrar tareas por el día seleccionado
      const isoDate = todayBtn.getAttribute('data-date') || null;
      const detail = {
        quincena: currentQuincena,
        diaIndex: diaSeleccionado,
        dateString: isoDate,
        empleadoId: empleado.id
      };
      document.dispatchEvent(new CustomEvent('diaQuincenaSelected', { detail }));
      const dayName = todayBtn.getAttribute('data-dayname');
      renderTaskSections(dayName);
    }
  } catch (err) {
    // no bloquear si por alguna razón falla la selección automática
    console.error('Auto-selección día actual fallo:', err);
  }

  // Delegación de eventos para quincenas y días
  headerDiv.addEventListener('click', (ev) => {
    const qBtn = ev.target.closest('.quincena-item');
    if (qBtn) {
      const q = parseInt(qBtn.getAttribute('data-quincena'), 10) || 1;
      currentQuincena = q;
      // Actualizamos aria-pressed en botones
      headerDiv.querySelectorAll('.quincena-item').forEach(el => el.setAttribute('aria-pressed', el === qBtn ? 'true' : 'false'));
      // Re-render calendario (puede diferenciar semanas si se quiere)
      renderCalendario(currentQuincena);
      // Reset selección
      diaSeleccionado = null;
      return;
    }

    const diaBtn = ev.target.closest('.calendario-dia');
    if (diaBtn) {
      const idx = parseInt(diaBtn.getAttribute('data-dia-index'), 10);
      // Limpiar selección previa
      headerDiv.querySelectorAll('.calendario-dia').forEach(el => {
        el.classList.remove('dia-selected');
        el.setAttribute('aria-pressed', 'false');
      });
      // Marcar seleccionado
      diaBtn.classList.add('dia-selected');
      diaBtn.setAttribute('aria-pressed', 'true');
      diaSeleccionado = idx;

      // Emite evento con detalle (quincena, índice, formato simple)
      const isoDate = diaBtn.getAttribute('data-date') || null;
      const detail = {
        quincena: currentQuincena,
        diaIndex: idx,
        dateString: isoDate, // formato 'YYYY-MM-DD'
        empleadoId: empleado.id
      };
      document.dispatchEvent(new CustomEvent('diaQuincenaSelected', { detail }));
      // Además: filtrar las tareas por el día seleccionado usando el atributo guardado
      const dayName = diaBtn.getAttribute('data-dayname');
      renderTaskSections(dayName);
    }
  });
}

function parseHora(horaStr) {
  if (!horaStr) return 999999;
  const [hh, mm = "0"] = horaStr.split(":");
  return parseInt(hh, 10) * 60 + parseInt(mm, 10);
}

function crearSeccionTareas(titulo, lista) {
  const sectionWrapper = document.createElement("div");
  const h2 = document.createElement("h2");
  h2.classList.add("tasks-section-title");
  h2.textContent = titulo;
  sectionWrapper.appendChild(h2);

  if (!lista.length) {
    const pVacio = document.createElement("p");
    pVacio.classList.add("tasks-empty");
    pVacio.textContent = "No hay tareas en esta sección.";
    sectionWrapper.appendChild(pVacio);
    return sectionWrapper;
  }

  const tareasPorDia = {};
  lista.forEach(t => {
    const dia = t.dia || "Sin día";
    (tareasPorDia[dia] ||= []).push(t);
  });

  for (const [dia, tareasDelDia] of Object.entries(tareasPorDia)) {
    const h3 = document.createElement("h3");
    h3.classList.add("tasks-day-title");
    h3.textContent = `${dia}:`;
    sectionWrapper.appendChild(h3);

    const ul = document.createElement("ul");
    ul.classList.add("tasks-list");

    tareasDelDia.forEach(t => {
      const li = document.createElement("li");
      const spanName  = Object.assign(document.createElement("span"), { className: "task-name",  textContent: t.nombre });
      const spanHour  = Object.assign(document.createElement("span"), { className: "task-hour",  textContent: t.hora || "-" });
      const spanExtra = Object.assign(document.createElement("span"), { className: "task-extra", textContent: t.descripcion || "" });
      li.append(spanName, spanHour, spanExtra);
      ul.appendChild(li);
    });

    sectionWrapper.appendChild(ul);
  }

  return sectionWrapper;
}