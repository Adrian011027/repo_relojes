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
  headerDiv.innerHTML = `<p>Tareas de ${empleado.nombre}</p>`;

  const bodyDiv = document.createElement("div");
  bodyDiv.classList.add("tasks-card-body");

  const allTasks = getAllTasks(empleado);
  const realizadasBackup = tareasRealizadasMap[empleado.id] || [];
  const byHora = (a, b) => parseHora(a.hora) - parseHora(b.hora);

  const tareasPend    = allTasks.filter(t => t.estatus === 1).sort(byHora);
  const tareasPorHacer= allTasks.filter(t => t.estatus === 2).sort(byHora);
  const tareasReal = [
    ...allTasks.filter(t => t.estatus === 0),
    ...realizadasBackup
  ].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)
   .sort(byHora);
  const tareasExtra   = allTasks.filter(t => t.estatus === 3).sort(byHora);

  bodyDiv.appendChild(crearSeccionTareas("Tareas Pendientes",  tareasPend));
  bodyDiv.appendChild(crearSeccionTareas("Tareas por Realizar", tareasPorHacer));
  bodyDiv.appendChild(crearSeccionTareas("Tareas Realizadas",  tareasReal));
  bodyDiv.appendChild(crearSeccionTareas("Tareas Extras",      tareasExtra));

  calendarioContainer.appendChild(headerDiv);
  calendarioContainer.appendChild(bodyDiv);
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