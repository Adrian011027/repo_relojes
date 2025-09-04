/* registrar.js  (tarjeta vuela, modal centrado con fade‑IN de opacidad) */
document.addEventListener('DOMContentLoaded', () => {

  /* 1 · Offsets CSS */
  const css      = getComputedStyle(document.documentElement);
  const OFFSET_X = parseFloat(css.getPropertyValue('--fly-offset-x')) || -18;
  const OFFSET_Y = parseFloat(css.getPropertyValue('--fly-offset-y')) || -112;

  /* 2 · DOM refs */
  const ui = {
    menuPrinc   : document.getElementById('menu-principal'),
    secRegistrar: document.getElementById('seccion-registrar'),

    btnRegistrar: document.getElementById('registrar-equipo'),
    btnVolver   : document.getElementById('btn-volver-registrar'),

    contRelojes : document.getElementById('contenedor-relojes'),
    preJson     : document.getElementById('json-completo'),

    modal       : document.getElementById('modal-reloj'),
    modalClose  : document.getElementById('modal-close'),
    form        : document.getElementById('form-reloj'),
    fId         : document.getElementById('modal-id'),
    fEmp        : document.getElementById('modal-empleado'),

    overlay     : document.getElementById('modal-overlay')
  };

  /* 3 · Estado */
  let relojesCache = [];
  let pollingId    = null;
  let flyingCardData = null;   // { clone, original }

  /* 4 · Fade util – move=true usa .fade-in (con translateY),
                     move=false usa .fade-opacity (solo opacidad) */
  const fadeIn = (el, move = true) => {
    const base = move ? 'fade-in' : 'fade-opacity';
    el.classList.add(base);
    el.style.display = 'block';
    el.classList.remove('show');
    requestAnimationFrame(() => el.classList.add('show'));
  };

  /* 5 · Helpers */
  const pintarTarjetas = datos => {
    ui.contRelojes.innerHTML = datos.map((r, i) => `
      <div class="reloj ${r.estatus === 'conectado' ? 'conectado' : 'desconectado'}"
           data-idx="${i}">
        <strong>ID:</strong> ${r.reloj_id}<br>
        <strong>Empleado:</strong> ${r.empleado_id}<br>
        <strong>IP:</strong> ${r.ip}<br>
        <strong>UUID:</strong> ${r.uuid}<br>
        <strong>Estado:</strong> ${r.estatus}
      </div>`).join('');
  };

  /* ---------- clon volador ---------- */
  const crearClonVolador = card => {
    const rect = card.getBoundingClientRect();
    const clon = card.cloneNode(true);
    clon.classList.remove('reloj--oculta');
    clon.classList.add('reloj-fly');
    Object.assign(clon.style, {
      top   : `${rect.top}px`,
      left  : `${rect.left}px`,
      width : `${rect.width}px`,
      height: `${rect.height}px`,
      transform: 'translate(0,0)'
    });
    document.body.appendChild(clon);
    card.classList.add('reloj--oculta');
    return { clone: clon, original: card };
  };

  const volarHacia = (clone, destino) => {
    const rect = clone.getBoundingClientRect();
    const dx   = destino.x - rect.left;
    const dy   = destino.y - rect.top;
    clone.style.transform = `translate(${dx}px, ${dy}px) scale(1.13)`;
  };

  const regresarTarjeta = () => {
    if (!flyingCardData) return;
    const { clone, original } = flyingCardData;
    clone.style.transform = 'translate(0,0)';
    clone.addEventListener('transitionend', function h() {
      clone.removeEventListener('transitionend', h);
      clone.remove();
      original.classList.remove('reloj--oculta');
      flyingCardData = null;
    }, { once:true });
  };

  /* 6 · Modal */
  const abrirModal = async reloj => {
    await cargarEmpleados();
    ui.fId.value = reloj.reloj_id ?? '';
    ui.fEmp.value = String(reloj.empleado_id ?? '');

    const cardOriginal = ui.contRelojes.querySelector(
      `.reloj[data-idx="${relojesCache.indexOf(reloj)}"]`
    );
    if (cardOriginal) flyingCardData = crearClonVolador(cardOriginal);

    ui.overlay.style.display = 'block';

    /* Solo opacidad, mantiene translate(-50%, -50%) */
    fadeIn(ui.modal, false);

    if (flyingCardData) {
      requestAnimationFrame(() => {
        const modalRect = ui.modal.getBoundingClientRect();
        const cardW = cardOriginal.offsetWidth;
        const cardH = cardOriginal.offsetHeight;

        let destX = modalRect.left - cardW - OFFSET_X;
        if (destX < 0) destX = modalRect.right + OFFSET_X;

        const destY = modalRect.top + (modalRect.height - cardH) / 2 + OFFSET_Y;
        volarHacia(flyingCardData.clone, { x: destX, y: destY });
      });
    }
  };

  const cerrarModal = () => {
    ui.modal.style.display = 'none';
    ui.modal.classList.remove('show');
    ui.overlay.style.display = 'none';
    regresarTarjeta();
  };

  /* 7 · Fetch auxiliares */
  const hacerPingRelojes = async () => { try { await fetch('/ping_relojes'); } catch {} };

  const cargarEmpleados = async () => {
    try {
      const r = await fetch('/users', { headers: { Accept: 'application/json' } });
      const { users=[] } = await r.json();
      ui.fEmp.innerHTML = users.map(
        u => `<option value="${u.empleado_id}">${u.username}</option>`
      ).join('');
    } catch {}
  };

  //enviar tareas
  const actualizarListaRelojes = async () => {
    if (ui.modal.style.display === 'block') return;
    try {
      const r = await fetch('/relojes_conectados.json');
      const datos = await r.json();
      relojesCache = (Array.isArray(datos) ? datos : []).filter(
        r => !r.empleado_id || r.empleado_id.trim() === ''
      );
      pintarTarjetas(relojesCache);
    } catch {}
  };

  /* 8 · Listeners */
  ui.btnRegistrar.addEventListener('click', async () => {
  ui.menuPrinc.style.display = 'none';
  ui.secRegistrar.style.display = 'block'; // 👈 sin fade, se muestra directo
  await hacerPingRelojes();
  await actualizarListaRelojes();
  pollingId = setInterval(actualizarListaRelojes, 10_000);
});


  ui.btnVolver.addEventListener('click', () => {
    ui.secRegistrar.style.display = 'none'; // desaparición instantánea
    ui.secRegistrar.classList.remove('show');
    ui.menuPrinc.style.display = 'flex';
    clearInterval(pollingId);
  });

  ui.contRelojes.addEventListener('click', ev => {
    const card = ev.target.closest('.reloj');
    if (!card) return;
    const idx = +card.dataset.idx;
    if (!Number.isNaN(idx) && relojesCache[idx]) abrirModal(relojesCache[idx]);
  });

  ui.modalClose?.addEventListener('click', cerrarModal);
  ui.overlay.addEventListener('click', cerrarModal);

  /* 9 · Form PATCH */

/* 9 · Form PATCH */
ui.form.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = { reloj_id: ui.fId.value, empleado_id: ui.fEmp.value };

  console.log("📤 Payload enviado:", payload); // 👈 Aquí lo ves en consola del navegador

  try {
    await fetch(`/update_reloj_id/${payload.reloj_id}`, {
      method : 'PATCH',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify(payload)
    });

    await fetch(`/tareas_reloj/${payload.reloj_id}`, {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Error asignando reloj:', err);
  } finally {
    cerrarModal();                     
    await actualizarListaRelojes();    
  }
});



});
