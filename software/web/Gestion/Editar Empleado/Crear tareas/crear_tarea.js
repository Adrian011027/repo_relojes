// web/gestion/Editar Empleado/Crear tareas/crear_tarea.js
import { enviarTarea } from "./crear_tarea_enviar.js";

export function abrirFormularioCrearTarea(empId, empName) {
  // Cierra cualquier modal activo
  document.querySelectorAll(".modal.active").forEach(m => m.classList.remove("active"));

  const modal = document.getElementById("modal-create-task");

  modal.innerHTML = `
    <div class="form-scope-container">
      <form id="tareaForm">
        <h3>Crear tarea</h3>
        <div class="inputGroup">
          <input type="text" id="nombreTarea" required>
          <label for="nombreTarea">Nombre de la tarea</label>
        </div>
        <div class="inputGroup">
          <input type="text" id="descripcionTarea" required>
          <label for="descripcionTarea">Descripción</label>
        </div>
        <div class="inputGroup">
          <input type="time" id="horaInicio" required>
          <label for="horaInicio">Hora de inicio</label>
        </div>

        <h3>Días de la Semana</h3>
        <div class="checkbox-container">
          <label><input type="checkbox" value="domingo"> Domingo</label>
          <label><input type="checkbox" value="lunes"> Lunes</label>
          <label><input type="checkbox" value="martes"> Martes</label>
          <label><input type="checkbox" value="miercoles"> Miércoles</label>
          <label><input type="checkbox" value="jueves"> Jueves</label>
          <label><input type="checkbox" value="viernes"> Viernes</label>
          <label><input type="checkbox" value="sabado"> Sábado</label>
        </div>

        <div class="modal-actions">
          <button type="button" id="cancelarBtn">Cancelar</button>
          <button type="button" id="asignarTareaBtn">Asignar Tarea</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add("active");
  modal.classList.remove("hidden");

  // Cancelar
  document.getElementById("cancelarBtn").addEventListener("click", () => {
    modal.classList.remove("active");
    modal.classList.add("hidden");
  });

  // Guardar
  document.getElementById("asignarTareaBtn").addEventListener("click", () => {
    enviarTarea(empId);
  });
} export default(abrirFormularioCrearTarea)
