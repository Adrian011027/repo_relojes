// archivo: crearEmpleado.js

document.addEventListener("DOMContentLoaded", function () {
  const formCrear = document.getElementById("form-create-empleado");
  const btnVolverCrear = document.getElementById("btn-volver-crear");
  const btnCrearEmpleado = document.getElementById("crear-empleado");
  const seccionCrear = document.getElementById("seccion-crear");
  const menuPrincipal = document.getElementById("menu-principal");
  let formularioDinamico = null;

  // ========== FUNCIONALIDAD ORIGINAL ========== //
  if (formCrear) {
    formCrear.addEventListener("submit", async function (event) {
      event.preventDefault();
      await enviarFormularioEmpleado();
    });
  }

  if (btnVolverCrear) {
    btnVolverCrear.addEventListener("click", function () {
      if (seccionCrear) {
        seccionCrear.style.display = "none";
      }
      menuPrincipal.style.display = "flex";
      menuPrincipal.style.opacity = "1";
      menuPrincipal.style.pointerEvents = "all";
    });
  }

  if (btnCrearEmpleado) {
    btnCrearEmpleado.addEventListener("click", function () {
      menuPrincipal.style.display = "none";
      menuPrincipal.style.pointerEvents = "none";

      if (seccionCrear) {
        seccionCrear.style.display = "block";
      } else {
        crearFormularioDinamico();
      }
    });
  }

  // ========== NUEVA FUNCIONALIDAD ========== //
  function crearFormularioDinamico() {
    formularioDinamico = document.createElement('div');
    formularioDinamico.id = "seccion-crear-dinamica";
    formularioDinamico.className = "section-form";

    formularioDinamico.innerHTML = `
      <div class="form-scope">
        <div class="form-scope-container">
          <h2>Registro de Empleado</h2>
          <br><br>
          <form id="form-create-empleado-dinamico" method="POST" enctype="multipart/form-data">
            <div class="inputGroup">
              <input type="text" id="nombre" name="nombre" required>
              <label for="nombre">Nombre:</label>
            </div>
            <div class="inputGroup">
              <input type="text" id="puesto" name="puesto" required>
              <label for="puesto">Puesto:</label>
            </div>
            <div class="inputGroup">
              <input type="text" id="username" name="username" required>
              <label for="username">Username:</label>
            </div>
            <div class="inputGroup">
              <input type="password" id="password" name="password" required>
              <label for="password">Password:</label>
            </div>
            <div class="inputGroup">
              <select id="role" name="role" required>
                <option value="" disabled selected></option>
                <option value="empleado">Empleado</option>
                <option value="admin">Admin</option>
              </select>
              <label for="role">Role:</label>
            </div>
            <div class="inputGroup">
              <input type="file" id="imagen" name="imagen" accept="image/*" required>
              <label for="imagen">Imagen:</label>
            </div>
            <button type="submit">Crear Empleado</button>
          </form>
          <button id="btn-volver-crear-dinamico">Volver</button>
        </div>
      </div>
    `;

    document.querySelector('.container').appendChild(formularioDinamico);
    inicializarEventosDinamicos();
  }

  function inicializarEventosDinamicos() {
    const formDinamico = document.getElementById("form-create-empleado-dinamico");
    const btnVolverDinamico = document.getElementById("btn-volver-crear-dinamico");

    if (formDinamico) {
      formDinamico.addEventListener("submit", async function (event) {
        event.preventDefault();
        await enviarFormularioEmpleado();
      });
    }

    if (btnVolverDinamico) {
      btnVolverDinamico.addEventListener("click", function () {
        if (formularioDinamico) {
          formularioDinamico.remove();
        }

        menuPrincipal.style.display = "flex";
        menuPrincipal.style.opacity = "1";
        menuPrincipal.style.pointerEvents = "all";
      });
    }
  }
});

// Función original de envío
export async function enviarFormularioEmpleado() {
  const form = document.getElementById("form-create-empleado") ||
               document.getElementById("form-create-empleado-dinamico");

  const formData = new FormData(form);

  try {
    const response = await fetch("/empleados", {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const resultado = await response.json();
    console.log("Empleado creado:", resultado);
    window.location.href = "/gestion";

  } catch (error) {
    console.error("Error al enviar:", error);
    alert("Error al crear empleado: " + error.message);
  }
}
