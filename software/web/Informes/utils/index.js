// ----------- Helpers generales --------------

export function animateCounter(element, target) {
  let current = 0;
  const duration = 1000;
  const stepTime = 20;
  const step = target / (duration / stepTime);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    element.textContent = Math.floor(current);
  }, stepTime);
}

/**
 * Devuelve TODAS las tareas (cualquier estatus) aplanadas en un solo array
 * añadiendo el campo `dia` capitalizado.
 */
export function getAllTasks(empleado) {
  const tasks = [];
  if (!empleado || !empleado.tareas_asignadas) return tasks;

  Object.entries(empleado.tareas_asignadas).forEach(([diaKey, dayTasks]) => {
    if (!Array.isArray(dayTasks)) return;
    const diaCapitalizado = diaKey.charAt(0).toUpperCase() + diaKey.slice(1);
    dayTasks.forEach(t => tasks.push({ ...t, dia: diaCapitalizado }));
  });

  return tasks;
}

// Día actual en minúsculas
export function getCurrentDayName() {
  const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  return days[new Date().getDay()];
}

export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);