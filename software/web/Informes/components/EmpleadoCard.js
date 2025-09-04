import { mostrarTareasEmpleado } from "./TareasPanel.js";

export function createEmpleadoCard(empleado, index) {
  const card = document.createElement("div");
  card.classList.add("empleado-card", `card-color-${index % 6}`);

  const foto = document.createElement("img");
  foto.src = "/web/Images/" + empleado.imagen;
  foto.alt = `Foto de ${empleado.nombre}`;

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("empleado-info");

  const nombre = document.createElement("h2");
  nombre.textContent = empleado.nombre;

  const puesto = document.createElement("p");
  puesto.textContent = empleado.puesto;

  infoDiv.appendChild(nombre);
  infoDiv.appendChild(puesto);

  card.appendChild(foto);
  card.appendChild(infoDiv);

  card.addEventListener("click", () => {
    window.currentEmpleado = empleado;
    mostrarTareasEmpleado(empleado);
  });

  return card;
}