/* gestion.js --------------------------------------------------------------- */
export function abrirModal(id) {
  const modal = document.getElementById(id);
  modal ? modal.classList.add("active")
        : console.error(`No se encontró el modal con id="${id}"`);
}

/* -------- restricción de rol -------- */
const usuario = JSON.parse(localStorage.getItem("loggedUser"));
if (!usuario || usuario.role !== "admin") {
  window.location.href = "/inicio";
}

document.addEventListener("DOMContentLoaded", () => {
  /* 1 · FADE-IN al contenedor general ------------------------------------ */
  const subContenedor = document.getElementById("contenido-fade");
  subContenedor && requestAnimationFrame(() => subContenedor.classList.add("show"));

  /* 2 · Referencias ------------------------------------------------------- */
  const menuPrincipal   = document.getElementById("menu-principal");
  const seccionEditar   = document.getElementById("seccion-editar");
  const listaEmpleados  = document.getElementById("lista-empleados");    // <div>
  const opcionesEdicion = document.getElementById("opciones-edicion");

  const btnVolverEditar   = document.getElementById("btn-volver-editar");
  const btnEditarEmpleado = document.getElementById("editar-empleado");

  window.empleadoSeleccionadoID = null;

  /* 3 · Estado inicial ---------------------------------------------------- */
  seccionEditar.style.display = "none";
  opcionesEdicion.style.display = "none";

  /* 4 · Botón “Editar Empleado” ------------------------------------------ */
  btnEditarEmpleado.addEventListener("click", () => {
    /* oculta menú y muestra editor */
    menuPrincipal.style.display = "none";
    seccionEditar.style.display = "block";
    seccionEditar.classList.remove("fade-in", "show");
    void seccionEditar.offsetWidth;      // reflow
    seccionEditar.classList.add("fade-in");
    requestAnimationFrame(() => seccionEditar.classList.add("show"));

    /* limpia lista y opciones */
    listaEmpleados.innerHTML = "";
    opcionesEdicion.style.display = "none";

    /* obtiene empleados */
    fetch("/empleados")
      .then(res => res.json())
      .then(data => {
        listaEmpleados.innerHTML = "";

        data.forEach((emp, index) => {
          /* ---------- tarjeta ---------- */
          const card = document.createElement("div");
          card.classList.add("empleado-card", `card-color-${index % 6}`);
          card.dataset.id     = emp.id;
          card.dataset.nombre = emp.nombre;
          card.dataset.puesto = emp.puesto ?? "— sin puesto —";

          /* avatar */
          const img = document.createElement("img");
          img.src = `/web/Images/${emp.imagen || "default.jpg"}`;
          img.alt = `${emp.nombre} Foto`;
          img.classList.add("empleado-img");

          /* contenedor texto */
          const info = document.createElement("div");
          info.classList.add("empleado-info");

          const nombre = document.createElement("p");
          nombre.textContent = emp.nombre;
          nombre.classList.add("empleado-nombre");

          const puesto = document.createElement("p");
          puesto.textContent = emp.puesto ?? "— sin puesto —";
          puesto.classList.add("empleado-puesto");

          info.append(nombre, puesto);
          card.append(img, info);

          /* click de selección */
          card.addEventListener("click", () => {
            window.empleadoSeleccionadoID = emp.id;
            document.querySelectorAll(".empleado-card.selected")
                    .forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            document.querySelectorAll(".modal.active")
                    .forEach(m => m.classList.remove("active"));
            opcionesEdicion.style.display = "block";
          });

          listaEmpleados.appendChild(card);
        });
      })
      .catch(err => console.error("Error al obtener empleados:", err));
  });

  /* 5 · Delegación de clic en la lista ----------------------------------- */
  listaEmpleados.addEventListener("click", e => {
    const card = e.target.closest(".empleado-card");
    if (!card) return;

    window.empleadoSeleccionadoID = card.dataset.id;
    document.querySelectorAll(".empleado-card.selected")
            .forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    document.querySelectorAll(".modal.active")
            .forEach(m => m.classList.remove("active"));
    opcionesEdicion.style.display = "block";
  });

  /* 6 · Botón Volver ------------------------------------------------------ */
  btnVolverEditar.addEventListener("click", () => {
    seccionEditar.style.display = "none";
    menuPrincipal.style.display = "flex";
  });

  /* 7 · Utilidad cerrarModal --------------------------------------------- */
  function cerrarModal(id) {
    const m = document.getElementById(id);
    m && m.classList.remove("active");
  }
}); // DOMContentLoaded
