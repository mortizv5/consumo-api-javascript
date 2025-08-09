// ========== Config RapidAPI ==========
const RAPID_HOST = 'themealdb.p.rapidapi.com';
const RAPID_KEY  = '737cc10d48msh2125891a5e90a23p1a766ajsnef55852bd5ac';


// ========== Elementos del DOM ==========
const form          = document.getElementById('search-form');
const input         = document.getElementById('search-input');
const cardsContainer= document.getElementById('cards-container');
const loader        = document.getElementById('loader');
const statusMessage = document.getElementById('status-message');

function showLoader(show) {
  loader.classList.toggle('d-none', !show);
}

function setStatusMessage(msg = '', isError = false) {
  statusMessage.textContent = msg;
  statusMessage.classList.toggle('d-none', msg.length === 0);
  statusMessage.classList.toggle('text-danger', isError);
}

function clearCards() {
  cardsContainer.innerHTML = '';
}

// Trunca texto para la tarjeta
function truncate(text, max = 140) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max).trim() + '…' : text;
}

// Construye una tarjeta Bootstrap
function createCard(meal) {
  const col = document.createElement('div');
  col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';

  const card = document.createElement('div');
  card.className = 'card recipe h-100';

  const img = document.createElement('img');
  img.className = 'card-img-top';
  img.src = meal.strMealThumb;
  img.alt = meal.strMeal;

  const body = document.createElement('div');
  body.className = 'card-body d-flex flex-column';

  const title = document.createElement('h5');
  title.className = 'card-title';
  title.textContent = meal.strMeal;

  const meta = document.createElement('div');
  meta.className = 'mb-2 d-flex gap-2 flex-wrap';
  const badgeCat  = `<span class="badge text-bg-light border">${meal.strCategory || '—'}</span>`;
  const badgeArea = `<span class="badge text-bg-light border">${meal.strArea || '—'}</span>`;
  meta.innerHTML = badgeCat + badgeArea;

  const desc = document.createElement('p');
  desc.className = 'card-text flex-grow-1';
  desc.textContent = truncate(meal.strInstructions, 160);

  const link = document.createElement('a');
  link.className = 'btn btn-sm btn-outline-brand mt-2';
  link.href = meal.strSource || `https://www.google.com/search?q=${encodeURIComponent(meal.strMeal)}`;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'Ver receta';

  body.appendChild(title);
  body.appendChild(meta);
  body.appendChild(desc);
  body.appendChild(link);

  card.appendChild(img);
  card.appendChild(body);
  col.appendChild(card);
  return col;
}

// Renderiza lista de meals
function renderMeals(meals) {
  clearCards();
  if (!meals || meals.length === 0) {
    setStatusMessage('No se encontraron resultados. Prueba con otro término.', false);
    return;
  }
  setStatusMessage('');
  // Mostrar al menos 5 (si el API devuelve más, recortamos)
  const subset = meals.slice(0, Math.max(5, Math.min(12, meals.length)));
  subset.forEach(meal => cardsContainer.appendChild(createCard(meal)));
}

// ========== Consumo del API ==========
async function searchMeals(query = 'chicken') {
  showLoader(true);
  setStatusMessage('');
  clearCards();

  const url = `https://${RAPID_HOST}/search.php?s=${encodeURIComponent(query)}`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPID_KEY,
      'X-RapidAPI-Host': RAPID_HOST
    }
  };

  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderMeals(data.meals || []);
  } catch (err) {
    console.error(err);
    setStatusMessage('Ocurrió un error al cargar los datos. Intenta de nuevo.', true);
  } finally {
    showLoader(false);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = (input.value || '').trim();
  if (!q) {
    setStatusMessage('Escribe un término de búsqueda (ej. chicken, beef, pasta).', true);
    return;
  }
  searchMeals(q);
});