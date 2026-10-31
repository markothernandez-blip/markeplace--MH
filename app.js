// ===== Datos del catálogo (9 motos, precios referenciales ficticios) =====
const PRODUCTOS = [
  { id: 1, nombre: "AKT NKD 125", categoria: "Urbana", precio: 5200000,
    descripcion: "Moto urbana de 125 cc, ideal para la ciudad con diseño compacto y bajo consumo.", valoracion: 4.2,
    imagen: "Imagenes/AKT_AK125_NKD.JPG" },
  { id: 2, nombre: "Bajaj Boxer CT100", categoria: "Urbana", precio: 4500000,
    descripcion: "Moto económica y resistente, perfecta para el día a día y el trabajo.", valoracion: 4.4,
    imagen: "Imagenes/Bajaj_Boxer_CT100.jpg" },
  { id: 3, nombre: "Hero Hunk 125R", categoria: "Urbana", precio: 6800000,
    descripcion: "Estilo deportivo naked de 125 cc con frenos de disco y líneas agresivas.", valoracion: 4.5,
    imagen: "Imagenes/Hero_Hunk_125R.jpg" },
  { id: 4, nombre: "Honda XR150L", categoria: "Trail", precio: 9500000,
    descripcion: "Trail de 150 cc con suspensión reforzada para caminos rurales y destapados.", valoracion: 4.7,
    imagen: "Imagenes/Honda_XR150L.jpg" },
  { id: 5, nombre: "Honda XR190L", categoria: "Trail", precio: 12000000,
    descripcion: "Trail de 190 cc con más potencia para montaña y largas distancias.", valoracion: 4.6,
    imagen: "Imagenes/Honda_XR190L_2.0.jpg" },
  { id: 6, nombre: "Suzuki DR150 ABS", categoria: "Trail", precio: 9800000,
    descripcion: "Trail de 150 cc con sistema ABS para mayor seguridad en carretera y campo.", valoracion: 4.5,
    imagen: "Imagenes/Susuki_DR150_ABS.jpg" },
  { id: 7, nombre: "Suzuki GN125 ABS", categoria: "Urbana", precio: 6000000,
    descripcion: "Moto clásica de 125 cc con ABS, estilo retro y motor confiable.", valoracion: 4.3,
    imagen: "Imagenes/Susuki_GN125_ABS.jpg" },
  { id: 8, nombre: "Yamaha NMAX 155", categoria: "Scooter", precio: 15500000,
    descripcion: "Scooter de 155 cc con gran espacio de almacenamiento y confort para la ciudad.", valoracion: 4.8,
    imagen: "Imagenes/Yamaha_NMAX_155.jpg" },
  { id: 9, nombre: "Yamaha XTZ 150", categoria: "Trail", precio: 8900000,
    descripcion: "Trail de 150 cc versátil, con buen equilibrio entre ciudad y carretera destapada.", valoracion: 4.4,
    imagen: "Imagenes/Yamaha_XTZ_150.jpg" }
];

const formatearPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

// ===== Estado en memoria (sin localStorage) =====
const estado = {
  texto: "",
  categoria: "todas",
  orden: "relevancia"
};

let carrito = []; // Ejemplo: [{ id: 2, cantidad: 1 }]

// ===== Referencias al DOM =====
const inputBusqueda = document.getElementById("busqueda");
const selectCategoria = document.getElementById("categoria");
const selectOrden = document.getElementById("orden");
const resumen = document.getElementById("resumen");
const catalogo = document.getElementById("catalogo");
const vacio = document.getElementById("vacio");

const btnCarrito = document.getElementById("btn-carrito");
const contador = document.getElementById("contador");
const panel = document.getElementById("panel-carrito");
const fondo = document.getElementById("fondo");
const btnCerrar = document.getElementById("cerrar-carrito");
const listaCarrito = document.getElementById("lista-carrito");
const carritoVacio = document.getElementById("carrito-vacio");
const totalCarrito = document.getElementById("total-carrito");

// ===== Utilidades =====
function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function generarEstrellas(valoracion) {
  const llenas = Math.round(valoracion);
  return "★".repeat(llenas) + "☆".repeat(5 - llenas);
}

// Si una imagen no carga, se muestra un placeholder SVG generado en memoria
function imagenRespaldo(producto) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#4b5563"/>
    <text x="200" y="158" text-anchor="middle" font-family="Arial, sans-serif"
          font-size="22" font-weight="bold" fill="#fff">${escaparHtml(producto.nombre)}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

// ===== Catálogo: filtrado y ordenamiento =====
function obtenerProductosFiltrados() {
  const texto = normalizarTexto(estado.texto.trim());

  const filtrados = PRODUCTOS.filter((p) => {
    const coincideCategoria = estado.categoria === "todas" || p.categoria === estado.categoria;
    const coincideTexto =
      !texto || normalizarTexto(`${p.nombre} ${p.descripcion}`).includes(texto);
    return coincideCategoria && coincideTexto;
  });

  const copia = [...filtrados];
  switch (estado.orden) {
    case "precio-asc":
      return copia.sort((a, b) => a.precio - b.precio);
    case "precio-desc":
      return copia.sort((a, b) => b.precio - a.precio);
    case "valoracion":
      return copia.sort((a, b) => b.valoracion - a.valoracion);
    default:
      return copia.sort((a, b) => a.id - b.id);
  }
}

function crearTarjeta(p) {
  return `
    <article class="tarjeta">
      <div class="tarjeta__imagen">
        <img src="${escaparHtml(p.imagen)}"
             alt="Foto de la moto ${escaparHtml(p.nombre)}"
             width="400" height="300" loading="lazy" data-respaldo="${p.id}">
      </div>
      <div class="tarjeta__cuerpo">
        <span class="tarjeta__categoria">${escaparHtml(p.categoria)}</span>
        <h3>${escaparHtml(p.nombre)}</h3>
        <p class="descripcion">${escaparHtml(p.descripcion)}</p>
        <p class="valoracion">
          <span aria-hidden="true">${generarEstrellas(p.valoracion)}</span>
          <span class="sr-only">Valoración ${p.valoracion} de 5.</span>
          ${p.valoracion.toFixed(1)}
        </p>
        <p class="precio">${formatearPrecio.format(p.precio)}</p>
        <button type="button" class="btn-agregar" data-agregar="${p.id}"
                aria-label="Agregar ${escaparHtml(p.nombre)} al carrito">
          Agregar al carrito
        </button>
      </div>
    </article>`;
}

function renderizarCatalogo() {
  const lista = obtenerProductosFiltrados();

  catalogo.innerHTML = lista.map(crearTarjeta).join("");
  catalogo.hidden = lista.length === 0;
  vacio.hidden = lista.length > 0;
  resumen.textContent = `Mostrando ${lista.length} de ${PRODUCTOS.length} motos`;
}

// ===== Carrito =====
function buscarProducto(id) {
  return PRODUCTOS.find((p) => p.id === id);
}

function agregarAlCarrito(id) {
  const item = carrito.find((i) => i.id === id);
  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({ id, cantidad: 1 });
  }
  actualizarCarrito();
}

function cambiarCantidad(id, delta) {
  const item = carrito.find((i) => i.id === id);
  if (!item) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    quitarDelCarrito(id);
  } else {
    actualizarCarrito();
  }
}

function quitarDelCarrito(id) {
  carrito = carrito.filter((i) => i.id !== id);
  actualizarCarrito();
}

function calcularTotal() {
  return carrito.reduce((suma, item) => {
    const producto = buscarProducto(item.id);
    return suma + producto.precio * item.cantidad;
  }, 0);
}

function actualizarContador() {
  const cantidadTotal = carrito.reduce((suma, i) => suma + i.cantidad, 0);
  contador.textContent = cantidadTotal;
  const etiqueta = cantidadTotal === 1 ? "producto" : "productos";
  btnCarrito.setAttribute("aria-label", `Abrir carrito, ${cantidadTotal} ${etiqueta}`);
}

function renderizarCarrito() {
  const vacioCarrito = carrito.length === 0;
  carritoVacio.hidden = !vacioCarrito;
  listaCarrito.hidden = vacioCarrito;

  listaCarrito.innerHTML = carrito.map((item) => {
    const p = buscarProducto(item.id);
    const nombre = escaparHtml(p.nombre);
    const subtotal = p.precio * item.cantidad;

    return `
      <li class="item-carrito">
        <div>
          <strong>${nombre}</strong>
          <p>${formatearPrecio.format(p.precio)} c/u</p>
        </div>
        <div>
          <p class="subtotal">${formatearPrecio.format(subtotal)}</p>
          <div class="controles-cantidad">
            <button type="button" class="btn-secundario" data-accion="restar" data-id="${p.id}"
                    aria-label="Disminuir cantidad de ${nombre}">−</button>
            <span>${item.cantidad}</span>
            <button type="button" class="btn-secundario" data-accion="sumar" data-id="${p.id}"
                    aria-label="Aumentar cantidad de ${nombre}">+</button>
          </div>
          <button type="button" class="btn-quitar" data-accion="quitar" data-id="${p.id}"
                  aria-label="Quitar ${nombre} del carrito">Quitar</button>
        </div>
      </li>`;
  }).join("");

  totalCarrito.textContent = formatearPrecio.format(calcularTotal());
}

function actualizarCarrito() {
  renderizarCarrito();
  actualizarContador();
}

// ===== Panel del carrito (apertura, cierre y teclado) =====
function abrirCarrito() {
  panel.hidden = false;
  fondo.hidden = false;
  btnCarrito.setAttribute("aria-expanded", "true");
  btnCerrar.focus();
}

function cerrarCarrito() {
  panel.hidden = true;
  fondo.hidden = true;
  btnCarrito.setAttribute("aria-expanded", "false");
  btnCarrito.focus();
}

function alternarCarrito() {
  if (panel.hidden) {
    abrirCarrito();
  } else {
    cerrarCarrito();
  }
}

// ===== Eventos =====
inputBusqueda.addEventListener("input", (e) => {
  estado.texto = e.target.value;
  renderizarCatalogo();
});

selectCategoria.addEventListener("change", (e) => {
  estado.categoria = e.target.value;
  renderizarCatalogo();
});

selectOrden.addEventListener("change", (e) => {
  estado.orden = e.target.value;
  renderizarCatalogo();
});

// Respaldo cuando una imagen no se encuentra (captura, porque "error" no burbujea)
catalogo.addEventListener("error", (e) => {
  if (e.target.tagName !== "IMG") return;
  const producto = buscarProducto(Number(e.target.dataset.respaldo));
  if (producto) e.target.src = imagenRespaldo(producto);
}, true);

// Delegación de eventos para los botones "Agregar"
catalogo.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-agregar]");
  if (boton) {
    agregarAlCarrito(Number(boton.dataset.agregar));
  }
});

// Delegación de eventos para los controles del carrito
listaCarrito.addEventListener("click", (e) => {
  const boton = e.target.closest("[data-accion]");
  if (!boton) return;

  const id = Number(boton.dataset.id);
  switch (boton.dataset.accion) {
    case "sumar":
      cambiarCantidad(id, 1);
      break;
    case "restar":
      cambiarCantidad(id, -1);
      break;
    case "quitar":
      quitarDelCarrito(id);
      break;
  }
});

btnCarrito.addEventListener("click", alternarCarrito);
btnCerrar.addEventListener("click", cerrarCarrito);
fondo.addEventListener("click", cerrarCarrito);

// Cerrar con Escape y mantener el foco dentro del panel mientras está abierto
document.addEventListener("keydown", (e) => {
  if (panel.hidden) return;

  if (e.key === "Escape") {
    cerrarCarrito();
    return;
  }

  if (e.key === "Tab") {
    const enfocables = panel.querySelectorAll("button");
    if (enfocables.length === 0) return;

    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];

    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }
});

// ===== Inicialización =====
function inicializarFiltroCategorias() {
  const categorias = [...new Set(PRODUCTOS.map((p) => p.categoria))];
  selectCategoria.innerHTML =
    `<option value="todas">Todas las categorías</option>` +
    categorias.map((c) => `<option value="${escaparHtml(c)}">${escaparHtml(c)}</option>`).join("");
}

inicializarFiltroCategorias();
renderizarCatalogo();
actualizarCarrito();
