// web/gestion/Editar Empleado/Crear tareas/crear_tarea_enviar.js

export function enviarTarea(empId) {
  if (!empId) {
    alert("No se seleccionó un empleado.");
    return;
  }

  const nombre = document.getElementById("nombreTarea").value;
  const descripcion = document.getElementById("descripcionTarea").value;
  const horaInicio = document.getElementById("horaInicio").value;

  let tareasAsignadas = {};

  // Obtener los días seleccionados
  document.querySelectorAll(".checkbox-container input[type='checkbox']:checked").forEach(checkbox => {
    let dia = checkbox.value;
    if (!tareasAsignadas[dia]) {
      tareasAsignadas[dia] = [];
    }
    tareasAsignadas[dia].push({
      nombre,
      descripcion,
      hora: horaInicio,
      estatus: 2
    });
  });

  let data = { tareas_asignadas: tareasAsignadas };

  // Hacer request al backend
  fetch(`/tareas/${empId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(res => {
      // cerrar modal
      const modal = document.getElementById("modal-create-task");
      modal.classList.add("hidden");
      modal.classList.remove("active");
      location.reload(true); 
      // Si estás en actividades.js, refrescamos la tabla
      if (window.renderForCurrentState) {
        window.renderForCurrentState();
      }
    })
    .catch(error => {
      console.error("Error al asignar tarea:", error);
      alert("❌ Error al asignar tarea: " + error);
    });
}
