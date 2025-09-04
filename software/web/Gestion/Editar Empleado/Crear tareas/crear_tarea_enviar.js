export function enviarTarea() {
    // Asegurarnos de usar la variable global
    if (!window.empleadoSeleccionadoID) {
      alert("Selecciona un empleado antes de asignar una tarea.");
      return;
    }
  
  
    const nombre = document.getElementById("nombreTarea").value;
    const descripcion = document.getElementById("descripcionTarea").value;
    const horaInicio = document.getElementById("horaInicio").value;
    // Estructura de la tarea
    let tareasAsignadas = {};
  
    // Obtener los días seleccionados
    document.querySelectorAll(".checkbox-container input[type='checkbox']:checked").forEach(checkbox => {
      let diaIndex = checkbox.value;
      if (!tareasAsignadas[diaIndex]) {
        tareasAsignadas[diaIndex] = [];
      }
      tareasAsignadas[diaIndex].push({
        nombre,
        descripcion,
        hora: horaInicio,
        estatus: 2
      });
    });
    
  
    let data = { tareas_asignadas: tareasAsignadas };
    console.log(data)
    // Enviar los datos con fetch
    fetch(`/tareas/${window.empleadoSeleccionadoID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      console.log("Respuesta de la API:", response);
      return response.json();
    })
    .then(res => {
      console.log("Respuesta en JSON:", res);
      alert(res)
      window.location.href = "/gestion";
    })
    .catch(error => {
      console.error("Error al asignar tarea:", error);
      alert("Error al asignar tarea: " + error);
    });
  }
  