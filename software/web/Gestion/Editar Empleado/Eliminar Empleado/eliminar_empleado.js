document.addEventListener("DOMContentLoaded", function () {
  const btnEliminarEmpleado = document.getElementById("btn-eliminar-empleado");
  const seccionEditar = document.getElementById("seccion-editar");
  const menuPrincipal = document.getElementById("menu-principal");

  if (btnEliminarEmpleado) {
    btnEliminarEmpleado.addEventListener("click", function () {
      if (!window.empleadoSeleccionadoID) {
        alert("Primero selecciona un empleado.");
        return;
      }

      const confirmar = confirm("¿Estás seguro de que deseas eliminar este empleado?");
      if (!confirmar) return;

      fetch(`/empleados/${window.empleadoSeleccionadoID}`, { method: "DELETE" })
        .then(response => {
          if (response.ok) {
            console.log("Empleado eliminado correctamente.");

            // Ocultamos la sección de edición de inmediato (sin fade-out)
            if (seccionEditar) {
              seccionEditar.classList.remove("fade-in", "show");
              seccionEditar.style.display = "none";
            }

            // Mostramos el menú principal
            if (menuPrincipal) {
              menuPrincipal.style.display = "flex";
              menuPrincipal.style.opacity = "1";
              menuPrincipal.style.pointerEvents = "all";
            }

          } else {
            console.log("Error al eliminar el empleado.");
            alert("No se pudo eliminar el empleado. Intenta de nuevo.");
          }
        })
        .catch(error => {
          console.error("Error al eliminar empleado:", error);
          alert("Ocurrió un error al eliminar el empleado.");
        });
    });
  } else {
    console.warn("Botón 'Eliminar Empleado' no encontrado en el DOM.");
  }
});
