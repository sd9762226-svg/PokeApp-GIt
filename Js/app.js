import { initialPokemon } from "./db/pokemones.js";
import { initialUsers } from "./db/usuarios.js";
import { battleScenes } from "./db/game.js";

const main = document.querySelector("#app-main");
const toast = document.querySelector("#toast");
const userMenu = document.querySelector("#user-menu");
const searchInput = document.querySelector("#header-query");
const menuToggle = document.querySelector(".menu-toggle");
const eeveeImage = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png";
const storageKeys = {
  pokemon: "pokeapp.pokemon",
  users: "pokeapp.users",
  session: "pokeapp.session"
};
let toastTimer;
let battleScene = "start";
let uploadedImage = "";
let pokemon;
let users;
let currentUser;
let searchTerm = "";

function readCollection(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) {
      saveCollection(key, fallback);
      return [...fallback];
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) return parsed;
    throw new TypeError(`El dato guardado en ${key} no es una lista.`);
  } catch (error) {
    console.error(`No se pudo recuperar ${key}.`, error);
    showToast("No se pudieron leer algunos datos guardados. Se cargaron los datos iniciales.", "error");
    return [...fallback];
  }
}

function saveCollection(key, collection) {
  try {
    localStorage.setItem(key, JSON.stringify(collection));
    return true;
  } catch (error) {
    console.error(`No se pudieron guardar los datos en ${key}.`, error);
    showToast("No se pudieron guardar los cambios. Revisá el espacio disponible del navegador.", "error");
    return false;
  }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast is-visible ${type === "error" ? "toast-error" : ""}`;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

function navigate(route) {
  const destination = `#${route}`;
  if (window.location.hash === destination) render();
  else window.location.hash = destination;
  document.querySelector(".main-nav").classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function getRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return "inicio";
  return hash;
}

function typeClass(type) {
  return `type-${String(type).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
}

function pokemonCard(item) {
  const types = item.tipo.map((type) => `<span class="type-pill ${typeClass(type)}">${escapeHTML(type)}</span>`).join("");
  return `
    <article class="pokemon-card">
      <a class="pokemon-card-art" href="#detalle/${item.id}" data-route="detalle/${item.id}" aria-label="Ver detalle de ${escapeHTML(item.nombre)}">
        <span class="pokemon-number">#${String(item.id).padStart(3, "0")}</span>
        <img src="${escapeHTML(item.imagen)}" alt="${escapeHTML(item.nombre)}" loading="lazy">
        ${item.shiny ? '<span class="shiny-indicator" title="Tiene forma variocolor">✦</span>' : ""}
      </a>
      <div class="pokemon-card-info">
        <div class="card-title-row">
          <h2>${escapeHTML(item.nombre)}</h2>
          <span class="rarity">${escapeHTML(item.rareza)}</span>
        </div>
        <div class="type-list">${types}</div>
        <a class="text-link" href="#detalle/${item.id}" data-route="detalle/${item.id}">Ver información <span aria-hidden="true">→</span></a>
      </div>
    </article>`;
}

function filteredPokemon() {
  const term = searchTerm.trim().toLocaleLowerCase("es");
  return pokemon.filter((item) => !term || item.nombre.toLocaleLowerCase("es").includes(term)
    || item.tipo.some((type) => type.toLocaleLowerCase("es").includes(term)));
}

function renderHome() {
  const featured = pokemon.slice(0, 3);
  main.innerHTML = `
    <section class="hero">
      <div class="hero-decoration hero-decoration-one" aria-hidden="true">✦</div>
      <div class="hero-decoration hero-decoration-two" aria-hidden="true">✧</div>
      <div class="hero-pokemon" aria-label="Logo ilustrado de PokéDex">
        <div class="home-emblem"><span class="emblem-orbit"></span><span class="emblem-button"></span><strong>PokéDex</strong><small>WEB</small></div>
        <img class="hero-mon hero-mon-1" src="${escapeHTML(featured[0]?.imagen || "")}" alt="">
        <img class="hero-mon hero-mon-2" src="${escapeHTML(featured[1]?.imagen || "")}" alt="">
        <img class="hero-mon hero-mon-3" src="${escapeHTML(featured[2]?.imagen || "")}" alt="">
      </div>
      <div class="hero-copy">
        <span class="eyebrow">TU AVENTURA COMIENZA AQUÍ</span>
        <h1>Tu aventura Pokémon, en un solo lugar</h1>
        <p>Alterná entre los Pokémon de la Pokédex, descubrí sus características y encontrá los que querés sumar a tu aventura.</p>
        <p class="hero-description-secondary">Iniciá sesión para gestionar tu perfil, participá de una batalla y explorá todos los detalles de cada especie.</p>
        <div class="hero-actions">
          <a class="button button-red" href="#pokedex" data-route="pokedex">Explorar Pokédex <span aria-hidden="true">→</span></a>
          <a class="button button-light" href="#batalla" data-route="batalla">Ir a la aventura</a>
        </div>
      </div>
    </section>
    <section class="welcome-row">
      <div><span class="eyebrow">GOTTA CATCH 'EM ALL</span><h2>Tu mundo Pokémon, en un solo lugar.</h2></div>
      <a class="text-link" href="#pokedex" data-route="pokedex">Ver toda la Pokédex <span aria-hidden="true">→</span></a>
    </section>
    <section class="featured-grid" aria-label="Pokémon destacados">${featured.map(pokemonCard).join("")}</section>`;
}

function renderPokedex() {
  const results = filteredPokemon();
  main.innerHTML = `
    <section class="pokedex-page">
      <section class="section-heading">
        <div><span class="eyebrow">DESCUBRÍLOS A TODOS</span><h1>Pokédex</h1>
        <p>Explorá cada especie y conocé todo sobre tus Pokémon favoritos.</p></div>
        ${currentUser?.admin ? '<a class="button button-red add-button" href="#cargar" data-route="cargar">Cargar nuevos <span class="plus-icon">+</span></a>' : ""}
      </section>
      ${searchTerm ? `<p class="search-summary">Resultados para “${escapeHTML(searchTerm)}” <button type="button" class="clear-search" data-action="clear-search">Limpiar</button></p>` : ""}
      ${results.length ? `<section class="pokemon-grid">${results.map(pokemonCard).join("")}</section>`
        : '<div class="empty-state"><span>🔎</span><h2>No encontramos ese Pokémon</h2><p>Probá con otro nombre o tipo.</p></div>'}
    </section>`;
}

function renderDetail(id) {
  const item = pokemon.find((entry) => entry.id === Number(id));
  if (!item) {
    main.innerHTML = '<section class="empty-state"><h1>Pokémon no encontrado</h1><a class="button button-red" href="#pokedex" data-route="pokedex">Volver a la Pokédex</a></section>';
    return;
  }
  const types = item.tipo.map((type) => `<span class="type-pill ${typeClass(type)}">${escapeHTML(type)}</span>`).join("");
  const stats = [["HP", item.hp], ["Ataque", item.ataque], ["Defensa", item.defensa], ["Velocidad", item.velocidad]];
  main.innerHTML = `
    <a class="back-link" href="#pokedex" data-route="pokedex">← Volver a la Pokédex</a>
    <section class="detail-card">
      <div class="detail-art ${typeClass(item.tipo[0])}">
        <span class="detail-number">#${String(item.id).padStart(3, "0")}</span>
        <img id="detail-image" src="${escapeHTML(item.imagen)}" alt="${escapeHTML(item.nombre)}">
        ${item.shiny ? '<button class="shiny-toggle" type="button" data-action="toggle-shiny" aria-label="Mostrar forma variocolor">✦ Variocolor</button>' : ""}
      </div>
      <div class="detail-content">
        <span class="eyebrow">POKÉMON N.º ${String(item.id).padStart(3, "0")}</span>
        <h1>${escapeHTML(item.nombre)}</h1>
        <div class="type-list">${types}<span class="rarity">${escapeHTML(item.rareza)}</span></div>
        <p class="detail-description">${escapeHTML(item.descripcion)}</p>
        <div class="quick-facts">
          <div><span>Altura</span><strong>${escapeHTML(item.altura)} m</strong></div>
          <div><span>Peso</span><strong>${escapeHTML(item.peso)} kg</strong></div>
          <div><span>Generación</span><strong>${escapeHTML(item.generacion)}</strong></div>
          <div><span>Habilidad</span><strong>${escapeHTML(item.habilidad)}</strong></div>
        </div>
        <h2 class="subheading">Estadísticas</h2>
        <div class="stats-list">${stats.map(([label, value]) => `<div class="stat-row"><span>${label}</span><div class="stat-track"><span style="width:${Math.min(100, Number(value) / 1.5)}%"></span></div><strong>${escapeHTML(value)}</strong></div>`).join("")}</div>
        <div class="detail-actions">
          ${item.sonido ? `<button class="button button-light" type="button" data-action="play-cry" data-sound="${escapeHTML(item.sonido)}">♫ Escuchar su sonido</button>` : ""}
          ${item.tieneEvolucion ? `<p class="evolution-note">Evoluciona a <strong>${escapeHTML(item.evolucion)}</strong> en el nivel ${escapeHTML(item.nivelEvolucion)}.</p>` : ""}
        </div>
      </div>
    </section>`;
}

function renderAccount(register = false) {
  main.innerHTML = register ? `
    <section class="auth-panel">
      <div class="auth-brand"><span class="brand-mark"><span></span></span><span class="brand-name">Poke<span>App</span></span></div>
      <span class="eyebrow">SUMATE A LA AVENTURA</span><h1>Registrarse</h1>
      <form id="register-form" class="auth-form">
        <label>Nombre completo<input name="nombre" type="text" autocomplete="name" required minlength="2" placeholder="Tu nombre"></label>
        <label>Correo electrónico<input name="email" type="email" autocomplete="email" required placeholder="entrenador@email.com"></label>
        <label>Nombre de usuario<input name="username" type="text" autocomplete="username" required minlength="3" placeholder="Elegí tu usuario"></label>
        <label>Contraseña<input name="password" type="password" autocomplete="new-password" required minlength="6" placeholder="Mínimo 6 caracteres"></label>
        <p class="auth-switch">¿Ya tenés una cuenta? <a href="#cuenta" data-route="cuenta">Iniciar sesión</a></p>
        <button class="button button-red button-wide" type="submit">Crear cuenta</button>
      </form>
      <div class="auth-pokemon"><img src="${escapeHTML(pokemon.find((item) => item.id === 25)?.imagen || "")}" alt="Pikachu"></div>
    </section>` : `
    <section class="auth-panel">
      <div class="auth-brand"><span class="brand-mark"><span></span></span><span class="brand-name">Poke<span>App</span></span></div>
      <span class="eyebrow">QUÉ BUENO VERTE DE NUEVO</span><h1>Accedé a tu cuenta</h1>
      <form id="login-form" class="auth-form">
        <label>Nombre de usuario<input name="username" type="text" autocomplete="username" required placeholder="Tu nombre de usuario"></label>
        <label>Contraseña<input name="password" type="password" autocomplete="current-password" required placeholder="Tu contraseña"></label>
        <p class="auth-switch">¿No tenés una cuenta? <a href="#registro" data-route="registro">Registrarse</a></p>
        <button class="button button-red button-wide" type="submit">Iniciar sesión</button>
      </form>
      <div class="auth-pokemon"><img src="${eeveeImage}" alt="Eevee"></div>
      <p class="demo-hint">Cuenta de prueba administrador: <strong>1234</strong> / <strong>password123</strong></p>
    </section>`;
}

function renderPokemonForm() {
  if (!currentUser?.admin) {
    main.innerHTML = '<section class="empty-state"><span>🔒</span><h1>Sección para administradores</h1><p>Iniciá sesión con una cuenta administradora para cargar Pokémon.</p><a class="button button-red" href="#cuenta" data-route="cuenta">Iniciar sesión</a></section>';
    return;
  }
  main.innerHTML = `
    <section class="section-heading form-heading"><div><span class="eyebrow">AMPLIÁ LA COLECCIÓN</span><h1>Ingresa tu nuevo Pokémon</h1><p>Completá su ficha para agregarlo a la Pokédex.</p></div></section>
    <form id="pokemon-form" class="pokemon-form">
      <div class="upload-preview" id="upload-preview"><div class="upload-placeholder"><span>⇧</span><strong>Subí una imagen</strong><small>PNG, JPG o WEBP (máx. 500 KB)</small></div></div>
      <div class="form-fields">
        <label>Nombre del Pokémon<input name="nombre" type="text" required placeholder="Ej. Bulbasaur"></label>
        <label>Descripción<textarea name="descripcion" rows="3" required placeholder="¿Qué hace este Pokémon?"></textarea></label>
        <label>Tipo(s)<input name="tipo" type="text" required placeholder="Ej. Planta, Veneno"><small>Separá los tipos con coma.</small></label>
        <div class="form-grid">
          <label>Altura (m)<input name="altura" type="number" min="0" step="0.1" required></label>
          <label>Peso (kg)<input name="peso" type="number" min="0" step="0.1" required></label>
          <label>Generación<input name="generacion" type="number" min="1" step="1" required></label>
          <label>Rareza<input name="rareza" type="text" required placeholder="Común"></label>
          <label>HP<input name="hp" type="number" min="1" step="1" required></label>
          <label>Ataque<input name="ataque" type="number" min="0" step="1" required></label>
          <label>Defensa<input name="defensa" type="number" min="0" step="1" required></label>
          <label>Velocidad<input name="velocidad" type="number" min="0" step="1" required></label>
        </div>
        <label>Habilidad<input name="habilidad" type="text" required></label>
        <label class="file-label">Imagen del Pokémon<input id="pokemon-image-file" name="imagenArchivo" type="file" accept="image/png,image/jpeg,image/webp"><small>También podés indicar una URL de imagen abajo.</small></label>
        <label>URL de imagen<input name="imagen" type="url" placeholder="https://..."></label>
        <label>URL del sonido<input name="sonido" type="url" placeholder="https://..."></label>
        <label>URL de imagen variocolor<input name="imagenShiny" type="url" placeholder="https://..."></label>
        <div class="form-grid form-options">
          <label>¿Tiene evolución?<select name="tieneEvolucion"><option value="false">No</option><option value="true">Sí</option></select></label>
          <label>¿Tiene forma variocolor?<select name="shiny"><option value="false">No</option><option value="true">Sí</option></select></label>
          <label>Nombre de evolución<input name="evolucion" type="text"></label>
          <label>Nivel de evolución<input name="nivelEvolucion" type="number" min="1" step="1"></label>
        </div>
        <button class="button button-red button-wide" type="submit">Agregar Pokémon</button>
      </div>
    </form>`;
}

function renderBattle() {
  const scene = battleScenes[battleScene];
  main.innerHTML = `
    <section class="battle-page">
      <div class="battle-heading"><span class="eyebrow">LORE · JUEGO</span><h1>¡A la batalla!</h1><p>Cada decisión cambia el rumbo de tu aventura.</p></div>
      <div class="battle-stage">
        <div class="battle-sky"><span class="cloud cloud-one"></span><span class="cloud cloud-two"></span>
          <div class="battle-mon battle-mon-player"><img src="${escapeHTML(pokemon.find((item) => item.id === 25)?.imagen || "")}" alt="Tu Pikachu"><span>PIKACHU · NV. 12</span></div>
          <div class="battle-mon battle-mon-wild"><img src="${eeveeImage}" alt="Eevee salvaje"><span>EEVEE SALVAJE</span></div>
        </div>
        <div class="battle-dialog"><span class="turn-label">TURNO ${battleScene === "start" ? "1" : "2"}</span><h2>${escapeHTML(scene.title)}</h2><p>${escapeHTML(scene.text)}</p>
          <div class="battle-options">${scene.options.map((option) => `<button class="button ${option.route ? "button-light" : "button-red"}" type="button" data-battle-next="${escapeHTML(option.next || "")}" ${option.route ? `data-battle-route="${escapeHTML(option.route)}"` : ""}>${escapeHTML(option.label)}</button>`).join("")}</div>
        </div>
      </div>
    </section>`;
}

function updateUserMenu() {
  if (currentUser) {
    userMenu.innerHTML = `<span class="welcome-user">Hola, <strong>${escapeHTML(currentUser.nombre)}</strong></span>
      ${currentUser.admin ? '<a class="admin-shortcut" href="#cargar" data-route="cargar">＋ Cargar Pokémon</a>' : ""}
      <button class="logout-button" type="button" data-action="logout">Salir</button>`;
  } else {
    userMenu.innerHTML = '<a class="login-shortcut" href="#cuenta" data-route="cuenta">Entrar</a>';
  }
}

function render() {
  const route = getRoute();
  document.querySelectorAll(".main-nav [data-route]").forEach((link) => {
    link.classList.toggle("is-active", route.startsWith(link.dataset.route));
  });
  updateUserMenu();
  if (route === "inicio") renderHome();
  else if (route === "pokedex") renderPokedex();
  else if (route.startsWith("detalle/")) renderDetail(route.split("/")[1]);
  else if (route === "cuenta") renderAccount(false);
  else if (route === "registro") renderAccount(true);
  else if (route === "cargar") renderPokemonForm();
  else if (route === "batalla") renderBattle();
  else renderHome();
  main.focus({ preventScroll: true });
}

function handleLogin(form) {
  const data = new FormData(form);
  const user = users.find((item) => item.username.toLowerCase() === String(data.get("username")).trim().toLowerCase()
    && item.password === data.get("password"));
  if (!user) {
    showToast("El usuario o la contraseña no son correctos.", "error");
    return;
  }
  currentUser = user;
  localStorage.setItem(storageKeys.session, String(user.id));
  showToast(`¡Bienvenido/a, ${user.nombre}!`);
  navigate("pokedex");
}

function handleRegistration(form) {
  const data = new FormData(form);
  const username = String(data.get("username")).trim();
  const email = String(data.get("email")).trim().toLowerCase();
  if (users.some((user) => user.username.toLowerCase() === username.toLowerCase() || user.email.toLowerCase() === email)) {
    showToast("Ese nombre de usuario o correo ya está registrado.", "error");
    return;
  }
  const nextUsers = [...users, {
    id: Math.max(0, ...users.map((user) => Number(user.id) || 0)) + 1,
    nombre: String(data.get("nombre")).trim(),
    email,
    username,
    password: String(data.get("password")),
    avatar: "./assets/avatar/squirtle.jpeg",
    admin: false
  }];
  if (!saveCollection(storageKeys.users, nextUsers)) return;
  users = nextUsers;
  showToast("¡Cuenta creada! Ya podés iniciar sesión.");
  navigate("cuenta");
}

function handlePokemonCreation(form) {
  if (!currentUser?.admin) return;
  const data = new FormData(form);
  const hasEvolution = data.get("tieneEvolucion") === "true";
  const hasShiny = data.get("shiny") === "true";
  const types = String(data.get("tipo")).split(",").map((type) => type.trim()).filter(Boolean);
  const image = uploadedImage || String(data.get("imagen")).trim();
  if (!image) {
    showToast("Elegí una imagen o ingresá la URL del Pokémon.", "error");
    return;
  }
  if (!types.length) {
    showToast("Ingresá al menos un tipo de Pokémon.", "error");
    return;
  }
  if (hasEvolution && (!String(data.get("evolucion")).trim() || !data.get("nivelEvolucion"))) {
    showToast("Completá la evolución y su nivel.", "error");
    return;
  }
  if (hasShiny && !String(data.get("imagenShiny")).trim()) {
    showToast("Ingresá la imagen de la forma variocolor.", "error");
    return;
  }
  const nextPokemon = [...pokemon, {
    id: Math.max(0, ...pokemon.map((item) => Number(item.id) || 0)) + 1,
    nombre: String(data.get("nombre")).trim(),
    tipo: types,
    descripcion: String(data.get("descripcion")).trim(),
    altura: Number(data.get("altura")),
    peso: Number(data.get("peso")),
    generacion: Number(data.get("generacion")),
    hp: Number(data.get("hp")),
    ataque: Number(data.get("ataque")),
    velocidad: Number(data.get("velocidad")),
    defensa: Number(data.get("defensa")),
    habilidad: String(data.get("habilidad")).trim(),
    tieneEvolucion: hasEvolution,
    evolucion: hasEvolution ? String(data.get("evolucion")).trim() : null,
    nivelEvolucion: hasEvolution && data.get("nivelEvolucion") ? Number(data.get("nivelEvolucion")) : null,
    rareza: String(data.get("rareza")).trim(),
    imagen: image,
    sonido: String(data.get("sonido")).trim(),
    shiny: hasShiny,
    imagenShiny: hasShiny ? String(data.get("imagenShiny")).trim() : ""
  }];
  if (!saveCollection(storageKeys.pokemon, nextPokemon)) return;
  pokemon = nextPokemon;
  uploadedImage = "";
  searchTerm = "";
  showToast("¡Pokémon agregado a la Pokédex!");
  navigate("pokedex");
}

document.addEventListener("click", (event) => {
  const routeLink = event.target.closest("[data-route]");
  if (routeLink) {
    event.preventDefault();
    navigate(routeLink.dataset.route);
    return;
  }
  const action = event.target.closest("[data-action]");
  if (action) {
    if (action.dataset.action === "logout") {
      localStorage.removeItem(storageKeys.session);
      currentUser = null;
      showToast("Cerraste sesión.");
      navigate("inicio");
      return;
    } else if (action.dataset.action === "clear-search") {
      searchTerm = "";
      searchInput.value = "";
      renderPokedex();
    } else if (action.dataset.action === "toggle-shiny") {
      const item = pokemon.find((entry) => entry.id === Number(getRoute().split("/")[1]));
      const image = document.querySelector("#detail-image");
      if (item && image) {
        const showingShiny = image.dataset.shiny === "true";
        image.src = showingShiny ? item.imagen : (item.imagenShiny || item.imagen);
        image.dataset.shiny = String(!showingShiny);
      }
    } else if (action.dataset.action === "play-cry") {
      const audio = new Audio(action.dataset.sound);
      audio.play().catch((error) => {
        console.error("No se pudo reproducir el sonido del Pokémon.", error);
        showToast("No se pudo reproducir el sonido.", "error");
      });
    }
  }
  const battleButton = event.target.closest("[data-battle-next]");
  if (battleButton) {
    if (battleButton.dataset.battleRoute) navigate(battleButton.dataset.battleRoute);
    else {
      battleScene = battleButton.dataset.battleNext;
      renderBattle();
    }
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.id === "header-search") {
    event.preventDefault();
    searchTerm = String(new FormData(form).get("query") || "").trim();
    navigate("pokedex");
  } else if (form.id === "login-form") {
    event.preventDefault();
    handleLogin(form);
  } else if (form.id === "register-form") {
    event.preventDefault();
    handleRegistration(form);
  } else if (form.id === "pokemon-form") {
    event.preventDefault();
    handlePokemonCreation(form);
  }
});

searchInput.addEventListener("input", () => {
  if (getRoute() === "pokedex") {
    searchTerm = searchInput.value;
    renderPokedex();
  }
});

main.addEventListener("change", (event) => {
  if (event.target.id !== "pokemon-image-file") return;
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 500 * 1024) {
    event.target.value = "";
    showToast("La imagen debe pesar menos de 500 KB.", "error");
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    uploadedImage = String(reader.result);
    document.querySelector("#upload-preview").innerHTML = `<img src="${uploadedImage}" alt="Vista previa del Pokémon">`;
  });
  reader.addEventListener("error", () => showToast("No se pudo leer el archivo de imagen.", "error"));
  reader.readAsDataURL(file);
});

menuToggle.addEventListener("click", () => {
  const isOpen = document.querySelector(".main-nav").classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

window.addEventListener("hashchange", render);

pokemon = readCollection(storageKeys.pokemon, initialPokemon);
users = readCollection(storageKeys.users, initialUsers);
const sessionId = Number(localStorage.getItem(storageKeys.session));
currentUser = users.find((user) => user.id === sessionId) || null;
render();
