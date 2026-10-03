// app.js — Interfaz móvil de Agroservicio La Cosecha.
const API = '/api';
let insumos = [];
let categoriaActual = '';
const carrito = new Map();

const lista = document.getElementById('lista');
const mensaje = document.getElementById('mensaje');
const respuesta = document.getElementById('respuesta');
const buscar = document.getElementById('buscar');

// Consulta el servidor. El filtro por categoría se realiza en la API.
async function cargarInsumos(categoria = '') {
  try {
    ocultarMensaje();
    categoriaActual = categoria;
    const url = categoria
      ? `${API}/insumos?categoria=${encodeURIComponent(categoria)}`
      : `${API}/insumos`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    insumos = await resp.json();
    buscar.value = '';
    dibujar(insumos);
  } catch (error) {
    mostrarError(`No se pudo cargar el catálogo: ${error.message}`);
  }
}

function dibujar(datos) {
  lista.innerHTML = '';

  if (datos.length === 0) {
    lista.innerHTML = '<p>No se encontraron insumos con ese criterio.</p>';
    return;
  }

  datos.forEach(i => {
    const alerta = i.existencias < 10
      ? '<span class="alerta">Pocas existencias</span>'
      : '';

    lista.insertAdjacentHTML('beforeend', `
      <article class="tarjeta">
        <h2>${i.nombre}</h2>
        <small>${i.categoria} · ${i.unidad}</small>
        <p class="precio"><strong>Q${i.precio.toFixed(2)}</strong></p>
        <p class="existencias">${i.existencias} disponibles ${alerta}</p>
        <div class="acciones">
          <input id="cantidad-${i.id}" type="number" min="1" max="${i.existencias}" value="1" aria-label="Cantidad de ${i.nombre}">
          <button class="boton-agregar" data-id="${i.id}" type="button">Agregar</button>
        </div>
      </article>`);
  });
}

// Búsqueda en vivo dentro del catálogo actualmente recibido del servidor.
buscar.addEventListener('input', e => {
  const texto = e.target.value.trim().toLowerCase();
  dibujar(insumos.filter(i => i.nombre.toLowerCase().includes(texto)));
});

// Cada chip vuelve a consultar el endpoint con ?categoria=.
document.getElementById('categorias').addEventListener('click', e => {
  const boton = e.target.closest('button[data-categoria]');
  if (!boton) return;

  document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('activo'));
  boton.classList.add('activo');
  cargarInsumos(boton.dataset.categoria);
});

// Agrega o actualiza la cantidad de un insumo en la cotización local.
lista.addEventListener('click', e => {
  const boton = e.target.closest('.boton-agregar');
  if (!boton) return;

  const id = Number(boton.dataset.id);
  const insumo = insumos.find(i => i.id === id);
  const campo = document.getElementById(`cantidad-${id}`);
  const cantidad = Number(campo.value);

  if (!insumo || !Number.isInteger(cantidad) || cantidad <= 0) {
    mostrarError('Ingresa una cantidad válida mayor que cero.');
    return;
  }

  if (cantidad > insumo.existencias) {
    mostrarError(`Solo hay ${insumo.existencias} de ${insumo.nombre}.`);
    return;
  }

  carrito.set(id, { insumo, cantidad });
  ocultarMensaje();
  actualizarResumen();
});

function actualizarResumen() {
  const resumen = document.getElementById('resumen');
  const contador = document.getElementById('contador');
  const items = [...carrito.values()];
  const unidades = items.reduce((suma, item) => suma + item.cantidad, 0);

  contador.textContent = `${items.length} insumo${items.length === 1 ? '' : 's'} · ${unidades} unidad${unidades === 1 ? '' : 'es'}`;

  if (items.length === 0) {
    resumen.className = 'resumen-vacio';
    resumen.textContent = 'Aún no has agregado insumos.';
    return;
  }

  resumen.className = 'resumen-lista';
  resumen.innerHTML = items.map(({ insumo, cantidad }) => `
    <div class="fila-resumen">
      <span>${insumo.nombre} × ${cantidad}</span>
      <strong>Q${(insumo.precio * cantidad).toFixed(2)}</strong>
    </div>`).join('');
}

// Envía la cotización al servidor; el subtotal y descuento se calculan únicamente allí.
document.getElementById('formCotizacion').addEventListener('submit', async e => {
  e.preventDefault();
  respuesta.hidden = true;

  const datos = {
    cliente: document.getElementById('cliente').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    items: [...carrito.entries()].map(([insumoId, item]) => ({
      insumoId,
      cantidad: item.cantidad
    }))
  };

  try {
    const resp = await fetch(`${API}/cotizaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const cuerpo = await resp.json();

    if (resp.status === 400) {
      mostrarError(cuerpo.mensaje || 'La cotización contiene datos no válidos.');
      return;
    }

    if (resp.status !== 201) {
      throw new Error(`HTTP ${resp.status}`);
    }

    ocultarMensaje();
    respuesta.className = 'respuesta exito';
    respuesta.innerHTML = `
      <h3>Cotización #${cuerpo.id} creada</h3>
      <p>Subtotal: <strong>Q${Number(cuerpo.subtotal).toFixed(2)}</strong></p>
      <p>Descuento: <strong>Q${Number(cuerpo.descuento).toFixed(2)}</strong></p>
      <p>Total: <strong>Q${Number(cuerpo.total).toFixed(2)}</strong></p>`;
    respuesta.hidden = false;

    carrito.clear();
    actualizarResumen();
    e.target.reset();
  } catch (error) {
    mostrarError(`No se pudo solicitar la cotización: ${error.message}`);
  }
});

function mostrarError(texto) {
  mensaje.textContent = texto;
  mensaje.hidden = false;
}

function ocultarMensaje() {
  mensaje.hidden = true;
  mensaje.textContent = '';
}

actualizarResumen();
cargarInsumos(categoriaActual);

// Registra el service worker para habilitar las funciones PWA.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(error => console.error('No se pudo registrar el service worker:', error));
  });
}
