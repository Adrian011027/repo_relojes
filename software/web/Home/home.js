// /web/Home/home.js
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // 1) Usuario logueado
    const loggedUserString = localStorage.getItem("loggedUser");
    let loggedUser = loggedUserString ? JSON.parse(loggedUserString) : { role: "visitante" };

    const welcomeMessageElem = document.getElementById("welcomeMessage");
    if (loggedUser.role === "admin") {
      welcomeMessageElem.textContent = `Bienvenido, ${loggedUser.username || "admin"}`;
    } else if (loggedUser.role === "visitante") {
      welcomeMessageElem.textContent = "Bienvenido, Visitante";
    } else {
      welcomeMessageElem.textContent = "Bienvenido, Usuario";
    }

    // 2) Cargar empleados
    const response = await fetch("/empleados.json");
    if (!response.ok) throw new Error("Error al obtener empleados.json");
    const empleados = await response.json();

    // 3) Determinar conjunto de empleados a considerar
    let empleadosParaLaGrafica = empleados;
    if (loggedUser.role !== "admin" && loggedUser.role !== "visitante") {
      const empleadoId = parseInt(loggedUser.empleado_id);
      if (!isNaN(empleadoId)) {
        empleadosParaLaGrafica = empleados.filter((e) => e.id === empleadoId);
      }
      const empRecord = (!isNaN(empleadoId) && empleados.find((e) => e.id === empleadoId)) || null;
      if (empRecord) {
        welcomeMessageElem.textContent = `Bienvenido, ${empRecord.nombre}`;
      }
    }

    // 4) Hora actual
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // 5) Día actual (sin tildes)
    const diasMap = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const diaKey = diasMap[now.getDay()];

    // 6) Helpers
    const isExtra = (t) => t && (t.estatus === 3 || t.estatus === 4);
    const isExtraTerminada = (t) => t && t.estatus === 4;

    function horaToMinutes(hora) {
      if (typeof hora === "string" && /^\d{1,2}:\d{2}$/.test(hora)) {
        const [H, M] = hora.split(":").map((x) => parseInt(x, 10));
        return (H || 0) * 60 + (M || 0);
      }
      return NaN;
    }

    // 7) Acumuladores
    let totalVencidas = 0;            // tareas hasta ahora
    let totalCompletadas = 0;         // de esas, cuántas completadas
    let totalExtrasTerminadas = 0;    // extras con estatus 4

    empleadosParaLaGrafica.forEach((emp) => {
      const tareasHoy = emp?.tareas_asignadas?.[diaKey] || [];

      // extras terminadas (4)
      totalExtrasTerminadas += tareasHoy.reduce((acc, t) => acc + (isExtraTerminada(t) ? 1 : 0), 0);

      // solo tareas normales (no extras)
      const tareasHorario = tareasHoy.filter((t) => !isExtra(t));

      // ordenadas por hora
      const ordenadas = tareasHorario
        .map((t) => ({ ...t, minutos: horaToMinutes(t.hora) }))
        .sort((a, b) => a.minutos - b.minutos);

      // tareas vencidas (hora <= ahora)
      const vencidas = ordenadas.filter((t) => !isNaN(t.minutos) && t.minutos <= nowMinutes);

      totalVencidas += vencidas.length;
      totalCompletadas += vencidas.reduce((acc, t) => acc + (t.estatus === 0 ? 1 : 0), 0);
    });

    // 8) Cálculos
    const C = 314; // circunferencia aprox de r=50
    const pctCompletadas = totalVencidas > 0 ? (totalCompletadas / totalVencidas) * 100 : 0;
    const completedLen = (pctCompletadas / 100) * C;

    // 9) Texto interno
    const countEl = document.getElementById("chartCount");
    if (countEl) countEl.textContent = `${totalCompletadas}/${totalVencidas}`;
    const percentEl = document.getElementById("chartPercent");
    if (percentEl) percentEl.textContent = `${Math.round(pctCompletadas)}%`;

    // 10) Contador de extras realizadas
    const extrasCountElem = document.getElementById("extrasCount");
    if (extrasCountElem) extrasCountElem.textContent = String(totalExtrasTerminadas);

    // 11) Pintado del círculo
    const circleCompleted = document.querySelector(".progress-ring__circle.completed");
    const circleNot = document.querySelector(".progress-ring__circle.not-completed");

    if (totalVencidas === 0) {
      circleCompleted?.parentNode?.removeChild(circleCompleted);
      circleNot?.parentNode?.removeChild(circleNot);
    } else {
      // base (rojo)
      if (circleNot) {
        circleNot.style.strokeDasharray = `${C} 0`;
        requestAnimationFrame(() => {
          circleNot.style.strokeDashoffset = "0";
        });
      }
      // completadas (azul)
      if (circleCompleted) {
        const seg = Math.max(0, Math.min(C, completedLen));
        circleCompleted.style.strokeDasharray = `${seg.toFixed(3)} ${(C - seg).toFixed(3)}`;
        requestAnimationFrame(() => {
          circleCompleted.style.strokeDashoffset = "0";
        });
      }
    }

    // 12) Animaciones de entrada
    function showElement(selector, delay) {
      setTimeout(() => {
        const elem = document.querySelector(selector);
        if (elem) elem.classList.add("show");
      }, delay);
    }
    showElement("h1", 250);
    showElement(".chart-wrapper", 700);
    showElement(".guia", 1150);
  } catch (error) {
    console.error("Error cargando datos de empleados:", error);
  }
});
