export async function obtenerEmpleados() {
  try {
    const response = await fetch("/empleados", { cache: "no-store" });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    return [];
  }
}

export async function obtenerBackup() {
  try {
    const resp = await fetch("/backup.json", { cache: "no-store" });
    if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
    return await resp.json();
  } catch (err) {
    console.error("Error al obtener backup.json:", err);
    return [];
  }
}

/**
 * Convierte backup.json a un mapa:
 *   { [empleadoId]: [ tareasConEstatus0 ... ] }
 */
export function crearMapaTareasRealizadas(backupData = []) {
  const mapa = {};
  backupData.forEach(emp => {
    const terminadas = [];
    Object.entries(emp.tareas_asignadas || {}).forEach(([dia, tasks]) => {
      tasks.forEach(t => terminadas.push({ ...t, dia }));
    });
    mapa[emp.id] = terminadas;
  });
  return mapa;
}