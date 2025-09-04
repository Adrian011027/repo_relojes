/* crear_tarea.js */
import { enviarTarea } from "./crear_tarea_enviar.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnCrearTarea = document.getElementById("btn-crear-tarea");

  const closeActiveModals = () =>
    document.querySelectorAll(".modal.active").forEach(m => m.classList.remove("active"));

  btnCrearTarea.addEventListener("click", () => {
    closeActiveModals(); // cierra cualquier modal

    const modal = document.getElementById("modal-create-task");

    modal.innerHTML = `
      <div class="form-scope-container">
        <h2>Registro de Tarea</h2>
        <form id="tareaForm">
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
            <!-- Checkbox Domingo -->
            <label class="dia-checkbox blue">
              <input type="checkbox" value="domingo">
              <span class="checkbox-wrapper">
                <span class="checkbox-bg"></span>
                <span class="checkbox-icon">
                  <svg viewBox="0 0 24 24">
                    <path class="check-path" d="M4 12l6 6L20 6" fill="none" stroke="currentColor" stroke-width="3"></path>
                  </svg>
                </span>
              </span>
              <span class="checkbox-label">Domingo</span>
            </label>
            <!-- Checkbox Lunes -->
            <label class="dia-checkbox green">
              <input type="checkbox" value="lunes">
              <span class="checkbox-wrapper">
                <span class="checkbox-bg"></span>
                <span class="checkbox-icon">
                  <svg viewBox="0 0 24 24">
                    <path class="check-path" d="M4 12l6 6L20 6" fill="none" stroke="currentColor" stroke-width="3"></path>
                  </svg>
                </span>
              </span>
              <span class="checkbox-label">Lunes</span>
            </label>
            <!-- Checkbox Martes -->
            <label class="dia-checkbox purple">
              <input type="checkbox" value="martes">
              <span class="checkbox-wrapper">
                <span class="checkbox-bg"></span>
                <span class="checkbox-icon">
                  <svg viewBox="0 0 24 24">
                    <path class="check-path" d="M4 12l6 6L20 6" fill="none" stroke="currentColor" stroke-width="3"></path>
                  </svg>
                </span>
              </span>
              <span class="checkbox-label">Martes</span>
            </label>
            <!-- Checkbox Miércoles -->
            <label class="dia-checkbox red">
              <input type="checkbox" value="miercoles">
              <span class="checkbox-wrapper">
                <span class="checkbox-bg"></span>
                <span class="checkbox-icon">
                  <svg viewBox="0 0 24 24">
                    <path class="check-path" d="M4 12l6 6L20 6" fill="none" stroke="currentColor" stroke-width="3"></path>
                  </svg>
                </span>
              </span>
              <span class="checkbox-label">Miércoles</span>
            </label>
            <!-- Checkbox Jueves -->
            <label class="dia-checkbox blue">
              <input type="checkbox" value="jueves">
              <span class="checkbox-wrapper">
                <span class="checkbox-bg"></span>
                <span class="checkbox-icon">
                  <svg viewBox="0 0 24 24">
                    <path class="check-path" d="M4 12l6 6L20 6" fill="none" stroke="currentColor" stroke-width="3"></path>
                  </svg>
                </span>
              </span>
              <span class="checkbox-label">Jueves</span>
            </label>
            <!-- Checkbox Viernes -->
            <label class="dia-checkbox green">
              <input type="checkbox" value="viernes">
              <span class="checkbox-wrapper">
                <span class="checkbox-bg"></span>
                <span class="checkbox-icon">
                  <svg viewBox="0 0 24 24">
                    <path class="check-path" d="M4 12l6 6L20 6" fill="none" stroke="currentColor" stroke-width="3"></path>
                  </svg>
                </span>
              </span>
              <span class="checkbox-label">Viernes</span>
            </label>
            <!-- Checkbox Sábado -->
            <label class="dia-checkbox purple">
              <input type="checkbox" value="sabado">
              <span class="checkbox-wrapper">
                <span class="checkbox-bg"></span>
                <span class="checkbox-icon">
                  <svg viewBox="0 0 24 24">
                    <path class="check-path" d="M4 12l6 6L20 6" fill="none" stroke="currentColor" stroke-width="3"></path>
                  </svg>
                </span>
              </span>
              <span class="checkbox-label">Sábado</span>
            </label>
          </div>
          <button type="button" id="asignarTareaBtn">Asignar Tarea</button>
        </form>
      </div>
    `;

    modal.classList.add("active");

    document.getElementById("asignarTareaBtn")
            .addEventListener("click", enviarTarea);
  });
});
