document.addEventListener('DOMContentLoaded', () => {
  buildMenu();
  attachMenuListeners();
  highlightActiveTab();
});

/**
 * Crea dinámicamente el menú con radio inputs, labels y la 'indicator',
 * según el estado de la sesión y el rol del usuario almacenado en localStorage.
 */
function buildMenu() {
  // Recupera el usuario autenticado del localStorage (puede ser null)
  const loggedUserString = localStorage.getItem("loggedUser");
  const loggedUser = loggedUserString ? JSON.parse(loggedUserString) : null;
  
  let menuItems = [];

  if (!loggedUser) {
    // No hay sesión iniciada (visitante)
    menuItems = [
      { tabId: 'tab-1', label: 'Inicio', href: '/inicio', defaultChecked: true },
      { tabId: 'tab-2', label: 'General', href: '/general' },
      { tabId: 'tab-3', label: 'Iniciar Sesión', href: '/login' }
    ];
  } else {
    // Hay sesión iniciada
    const userRole = loggedUser.role ? loggedUser.role.toLowerCase() : "";
    // Aceptar tanto "admin" como "administrador" para evitar inconsistencias
    if (userRole === "admin" || userRole === "administrador") {
      menuItems = [
        { tabId: 'tab-1', label: 'Inicio', href: '/inicio', defaultChecked: true },
        { tabId: 'tab-2', label: 'General', href: '/general' },
        { tabId: 'tab-3', label: 'Informes', href: '/informes' },
        { tabId: 'tab-4', label: 'Gestión', href: '/gestion' },
        { tabId: 'tab-5', label: 'Cerrar Sesión', href: '/logout' }
      ];
    } else {
      // Usuario empleado (no admin)
      menuItems = [
        { tabId: 'tab-1', label: 'Inicio', href: '/inicio', defaultChecked: true },
        { tabId: 'tab-2', label: 'General', href: '/general' },
        { tabId: 'tab-3', label: 'Informes', href: '/informes' },
        { tabId: 'tab-4', label: 'Cerrar Sesión', href: '/logout' }
      ];
    }
  }

  // Crear el contenedor principal del menú
  const tabContainer = document.createElement('div');
  tabContainer.classList.add('tab-container');
  
  // Ajustar el ancho del contenedor según el número de opciones
  // (Cada pestaña tiene 130px de ancho y se agregan 4px extra para compensar márgenes)
  tabContainer.style.width = `${menuItems.length * 130 + 4}px`;

  // Generamos dinámicamente cada radio input, label y la 'indicator'
  menuItems.forEach((item, index) => {
    // Crear el input tipo radio
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'tab';
    input.id = item.tabId;
    input.classList.add('tab', `tab--${index + 1}`);
    if (item.defaultChecked) {
      input.checked = true;
    }

    // Crear el label que contiene el enlace
    const label = document.createElement('label');
    label.htmlFor = item.tabId;
    label.classList.add('tab_label');

    // Crear el enlace <a>
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;

    // Insertar el enlace dentro del label
    label.appendChild(a);

    // Añadir el input y label al contenedor principal
    tabContainer.appendChild(input);
    tabContainer.appendChild(label);
  });

  // Crear la "indicator"
  const indicator = document.createElement('div');
  indicator.classList.add('indicator');
  tabContainer.appendChild(indicator);

  // Inyectar el menú en el contenedor correspondiente
  const menuContainer = document.getElementById('menu-container');
  menuContainer.innerHTML = ''; // Limpiar contenido previo
  menuContainer.appendChild(tabContainer);
}

/**
 * Intercepta los clics en los enlaces del menú para, por ejemplo,
 * cambiar la URL, resaltar la pestaña activa, etc.
 */
function attachMenuListeners() {
  const menuContainer = document.getElementById('menu-container');

  menuContainer.addEventListener('click', (event) => {
    const clickedElement = event.target;

    // Solo nos interesa si se hace clic en un <a>
    if (clickedElement.tagName === 'A') {
      const href = clickedElement.getAttribute('href');
      
      // Si se hace clic en "Cerrar Sesión" (href = /logout)
      if (href === '/logout') {
        event.preventDefault(); // Evitar la redirección inmediata
        // Eliminar la información del usuario en localStorage
        localStorage.removeItem("loggedUser");
        // Redirigir al endpoint de logout del backend
        window.location.href = "/logout";
        return;
      }
      
      // Si se hace clic en "Iniciar Sesión" (href = /login)
      if (href === '/login') {
        window.location.href = "/login";
        return;
      }
      
      // Para las demás opciones, actualizar la clase 'active'
      const links = menuContainer.querySelectorAll('a');
      links.forEach(link => link.classList.remove('active'));
      clickedElement.classList.add('active');

      // Actualizar la pestaña activa
      highlightActiveTab();
    }
  });
}

/**
 * Resalta la pestaña activa según la URL actual o según el <a> con clase 'active'.
 */
function highlightActiveTab() {
  const currentPath = window.location.pathname;
  const tabs = document.querySelectorAll('.tab_label');
  const indicator = document.querySelector('.indicator');

  let activeIndex = 0;

  tabs.forEach((tab, index) => {
    const link = tab.querySelector('a');
    // Quitar la clase 'active' a todos
    tab.classList.remove('active');

    // Si la ruta coincide con el href o si el enlace tiene la clase 'active'
    if (link && (link.getAttribute('href') === currentPath || link.classList.contains('active'))) {
      tab.classList.add('active');
      activeIndex = index;
    }
  });

  // Usar el ancho real de una pestaña para posicionar correctamente la indicator
  const tabWidth = tabs[0] ? tabs[0].offsetWidth : 130;
  requestAnimationFrame(() => {
    indicator.style.transform = `translateX(${activeIndex * tabWidth}px)`;
  });
}
