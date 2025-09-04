// editar_tarea_send.js
export async function update(data, dia) {
    let newdata = {
        "tareas_asignadas": {
            [dia]: [data] // Usamos corchetes para que `dia` se evalúe como variable
        }
    }
    console.log(newdata);   
    fetch(`/empleados/${window.empleadoSeleccionadoID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newdata)
      })
}
