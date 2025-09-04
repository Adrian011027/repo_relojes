// main.js
// ===============================================
import { obtenerEmpleados, obtenerBackup, crearMapaTareasRealizadas } from "./services/empleadosService.js";
import { createEmpleadoCard } from "./components/EmpleadoCard.js";
import { mostrarTareasEmpleado, setTareasRealizadasMap } from "./components/TareasPanel.js";

/* -------------------- Sesión ------------------- */
const usuario = JSON.parse(localStorage.getItem("loggedUser"));
if (!usuario || !["admin", "empleado"].includes(usuario.role)) {
  window.location.href = "/inicio";
}

/* ---- Datos globales en memoria (una sola carga) */
let empleadosData = [];
let tareasRealizadasMap = {};

/* ----------------- ADMIN ----------------------- */
async function generarItinerarios() {
  const tarjetasContainer = document.getElementById("tarjetas-container");
  if (!tarjetasContainer) {
    console.error("No existe contenedor con ID 'tarjetas-container'.");
    return;
  }

  tarjetasContainer.style.display = "block";
  tarjetasContainer.innerHTML = "";

  empleadosData.forEach((empleado, i) => {
    const card = createEmpleadoCard(empleado, i);
    tarjetasContainer.appendChild(card);
  });

  // fade-in
  setTimeout(() => {
    document.getElementById("informes-content")?.classList.add("show");
  }, 300);
}

/* ---------------- EMPLEADO --------------------- */
async function mostrarPanelDerecho(empleadoId) {
  // Oculta panel izq
  document.getElementById("tarjetas-container")?.style.setProperty("display", "none");

  const empleado = empleadosData.find(e => e.id === empleadoId);
  if (!empleado) {
    console.error("No se encontró empleado con ID:", empleadoId);
    return;
  }

  mostrarTareasEmpleado(empleado);

  setTimeout(() => {
    document.getElementById("informes-content")?.classList.add("show");
  }, 300);
}

/* ------------- Al cargar la página ------------- */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. Descargamos ambos JSON en paralelo
    const [emps, backup] = await Promise.all([
      obtenerEmpleados(),
      obtenerBackup()
    ]);

    empleadosData = emps;
    tareasRealizadasMap = crearMapaTareasRealizadas(backup);
    setTareasRealizadasMap(tareasRealizadasMap);

    const { role, empleado_id } = usuario;

    if (role === "admin") {
      await generarItinerarios();
    } else if (role === "empleado") {
      await mostrarPanelDerecho(parseInt(empleado_id, 10));
    }
  } catch (e) {
    console.error("Error inicializando aplicación:", e);
  }
});
