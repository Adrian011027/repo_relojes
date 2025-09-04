/* editar.js — versión definitiva */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Helper FADE ---------- */
  const aplicarFade = (el, displayType = "block") => {
    if (!el) return;
    el.classList.add("fade-in");
    el.classList.remove("show");
    el.style.display = displayType;
    requestAnimationFrame(() => el.classList.add("show"));
  };

  /* ---------- Referencias ---------- */
  const menuPrincipal   = document.getElementById("menu-principal");
  const seccionEditar   = document.getElementById("seccion-editar");
  const listaEmpleados  = document.getElementById("lista-empleados");
  const opcionesEdicion = document.getElementById("opciones-edicion");
  const empleadoSelTxt  = document.getElementById("empleado-seleccionado");
  const puestoTxt       = document.getElementById("puesto-trabajo");

  /* Botones (sin cambios) */
  const btnEditarEmpleado   = document.getElementById("editar-empleado");
  const btnVolverEditar     = document.getElementById("btn-volver-editar");
  const btnCrearTarea       = document.getElementById("btn-crear-tarea");
  const btnEditarTarea      = document.getElementById("btn-editar-tarea");
  const btnDatosEmpleado    = document.getElementById("btn-datos-empleado");
  const btnEliminarEmpleado = document.getElementById("btn-eliminar-empleado");
  const btnDP               = document.getElementById("btn_edit_dp");
  const btnCrearEnviarTarea = document.getElementById("modal-edit-personal-data_btn");

  window.empleadoSeleccionadoID = null;

  /* ---------- Utilidades ---------- */
  const closeActiveModals = () =>
    document.querySelectorAll(".modal.active")
            .forEach(m => m.classList.remove("active"));

  const openModal = id => {
    closeActiveModals();
    const m = document.getElementById(id);
    if (m) m.classList.add("active", "fade-in", "show");
  };

  /* ---------- Estado inicial ---------- */
  seccionEditar.style.display   = "none";
  opcionesEdicion.style.display = "none";
  if (puestoTxt) puestoTxt.textContent = "";

  /* ---------- Botón “Editar Empleado” ---------- */
  btnEditarEmpleado?.addEventListener("click", () => {
    menuPrincipal.style.display = "none";
    aplicarFade(seccionEditar, "flex");

    listaEmpleados.innerHTML      = "";
    opcionesEdicion.style.display = "none";
    empleadoSelTxt.textContent    = "";
    if (puestoTxt) puestoTxt.textContent = "";

    fetch("/empleados")
      .then(r => r.json())
      .then(data => {
        listaEmpleados.innerHTML = "";

        data.forEach((emp, idx) => {
          /* Toma el puesto de la clave que exista */
          const puesto =
            emp.puesto   ??   // tu JSON original
            emp.cargo    ??   // por si se llama “cargo”
            emp.role     ??   // por si llega como “role”
            emp.trabajo  ??   // cualquier otro nombre
            "— sin puesto —";

          const card = document.createElement("div");
          card.className = `empleado-card card-color-${idx % 6}`;
          card.dataset.id     = emp.id;
          card.dataset.nombre = emp.nombre;
          card.dataset.puesto = puesto;

          card.innerHTML = `
            <img class="empleado-img" src="/web/assets/empleados/${emp.imagen}" alt="${emp.nombre}">
            <div class="empleado-info">
              <p class="empleado-nombre">${emp.nombre}</p>
              <p class="empleado-puesto">${puesto}</p>
            </div>
          `;

          listaEmpleados.appendChild(card);
        });
      })
      .catch(console.error);
  });

  /* ---------- Selección por clic ---------- */
  listaEmpleados.addEventListener("click", e => {
    const card = e.target.closest(".empleado-card");
    if (!card) return;

    listaEmpleados.querySelectorAll(".empleado-card.selected")
                  .forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    window.empleadoSeleccionadoID = card.dataset.id;
    empleadoSelTxt.textContent =
      ` ${card.dataset.id} - Nombre: ${card.dataset.nombre}`;
    if (puestoTxt) puestoTxt.textContent = `Puesto: ${card.dataset.puesto}`;
    opcionesEdicion.style.display = "block";
    closeActiveModals();
  });

  /* ---------- Botón Volver ---------- */
  btnVolverEditar?.addEventListener("click", () => {
    seccionEditar.style.display = "none";
    seccionEditar.classList.remove("show");
    menuPrincipal.style.display  = "flex";
  });

  /* ---------- Resto de botones / modales (sin cambios) ---------- */
  btnCrearTarea?.addEventListener("click", () => openModal("modal-create-task"));
  btnEditarTarea?.addEventListener("click", () => {
    openModal("modal-edit-task");
    typeof mostrar_edit === "function" && mostrar_edit();
  });
  btnDatosEmpleado?.addEventListener("click", () => {
    if (!window.empleadoSeleccionadoID){
      alert("Selecciona un empleado");
      return;
    }
    openModal("modal-edit-personal-data");
  });
  btnCrearEnviarTarea?.addEventListener("click", () =>
    typeof enviarTarea === "function" && enviarTarea());
  btnDP?.addEventListener("click", () =>
    typeof editarPersonalData === "function" && editarPersonalData());
  btnEliminarEmpleado?.addEventListener("click", () => {
    if (!window.empleadoSeleccionadoID){
      alert("Selecciona un empleado");
      return;
    }
    if (confirm(`¿Eliminar empleado ${window.empleadoSeleccionadoID}?`)){
      fetch(`/empleados/${window.empleadoSeleccionadoID}`, {method:"DELETE"})
        .then(() => {
          window.empleadoSeleccionadoID = null;
          btnEditarEmpleado.click();   // recarga la lista
        })
        .catch(console.error);
    }
  });

}); /* DOMContentLoaded */
