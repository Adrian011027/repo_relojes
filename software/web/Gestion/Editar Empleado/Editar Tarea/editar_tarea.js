/* editar_tarea.js */
import { update } from "./editar_tarea_send.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnEditTarea = document.getElementById("btn-editar-tarea");

  const closeActiveModals = () =>
    document.querySelectorAll(".modal.active")
            .forEach(m => m.classList.remove("active"));

  btnEditTarea.addEventListener("click", () => {
    if (!window.empleadoSeleccionadoID) {
      alert("Selecciona un empleado primero.");
      return;
    }
    closeActiveModals();                           // cierra el que esté activo
    const modal = document.getElementById("modal-edit-task");
    modal.classList.add("active");
    mostrar_edit();
  });
});

export function mostrar_edit() {
  fetch(`/empleados/${window.empleadoSeleccionadoID}`)
    .then(r => r.json())
    .then(data => {
      const modal = document.getElementById("modal-edit-task");
      modal.innerHTML = `
        <div class="form-scope-container">
          <h2>Editar tareas</h2>
        </div>`;
      const cont = modal.firstElementChild;

      if (!data.tareas_asignadas) return;

      Object.entries(data.tareas_asignadas).forEach(([dia, tareas]) => {
        if (tareas.length === 0) return;

        const section = document.createElement("div");
        section.classList.add("day-section");

        const h3 = document.createElement("h3");
        h3.textContent = dia.charAt(0).toUpperCase() + dia.slice(1);
        section.appendChild(h3);

        tareas.forEach(tarea => {
          const form = document.createElement("form");
          form.classList.add("task-form");
          form.innerHTML = `
            <input type="text" value="${tarea.nombre}">
            <input type="text" value="${tarea.descripcion}">
            <input type="time" value="${tarea.hora}">
            <button type="submit">Guardar cambios</button>
          `;

          form.addEventListener("submit", e => {
            e.preventDefault();
            const [nombre, desc, hora] = form.querySelectorAll("input");
            tarea.nombre      = nombre.value;
            tarea.descripcion = desc.value;
            tarea.hora        = hora.value;
            update(tarea, dia);
          });

          section.appendChild(form);
        });

        cont.appendChild(section);
      });
    })
    .catch(err => {
      console.error("Error al obtener tareas:", err);
      alert("No se pudo cargar la información del empleado.");
    });
}
