export async function editarPersonalData() {
    console.log("Cargando datos personales...");

    if (!window.empleadoSeleccionadoID) {
        alert("Selecciona un empleado antes de editar tareas.");
        return;
    }

    const form = document.getElementById("form-edit-personal-data");
    const data = new FormData(form);
    const imagen = form.querySelector('input[name="img_dp"]').files[0];  // Cambié 'imagen' por 'img_dp'
    console.log("🔎 Imagen enviada: ", imagen);

    console.log("Enviando datos:", data);
    if (imagen) {
        console.log("Archivo de imagen: ", imagen.name, imagen.size, imagen.type);
    } else {
        console.log("No se seleccionó ninguna imagen.");
    }

    try {
        const response = await fetch(`/empleados/${window.empleadoSeleccionadoID}`, {
            method: "PATCH",
            body: data
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error en la solicitud:", errorData);
            alert("Error al actualizar datos.");
            return;
        }

        const resultado = await response.json();
        console.log("Empleado actualizado:", resultado);

        alert("Datos actualizados correctamente.");
        window.location.href = "/gestion";  // Redirigir después de la actualización

    } catch (error) {
        console.error("Error en la actualización:", error);
        alert("Ocurrió un error al actualizar los datos.");
    }
}
