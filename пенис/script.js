const cartItems = document.querySelector('.cart-items');
const favItems = document.querySelector('.fav-items');

const cartCounter = document.querySelector('.cart-count');
const favCounter = document.querySelector('.fav-count');

let cart = {};
let fav = {};

// ===== КОРЗИНА =====
document.querySelectorAll('.add').forEach(btn => {
  btn.onclick = () => {
    const card = btn.closest('.card');
    const id = card.dataset.id;
    const title = card.querySelector('h4').textContent;
    const img = card.querySelector('img').src;

    if (!cart[id]) {
      cart[id] = { title, img, count: 1 };
    } else {
      cart[id].count++;
    }

    renderCart();
  };
});

// ===== ЛАЙК =====
document.querySelectorAll('.like-item').forEach(btn => {
  btn.onclick = () => {
    const card = btn.closest('.card');
    const id = card.dataset.id;
    const title = card.querySelector('h4').textContent;
    const img = card.querySelector('img').src;

    const active = btn.classList.toggle('active');

    if (active) {
      fav[id] = { title, img };
    } else {
      delete fav[id];
    }

    renderFav();
  };
});

// ===== РЕНДЕР КОРЗИНЫ =====
function renderCart() {
  cartItems.innerHTML = '';
  let total = 0;

  Object.values(cart).forEach(item => {
    total += item.count;

    const div = document.createElement('div');
    div.className = 'item';

    div.innerHTML = `
      <img src="${item.img}">
      <div>
        <p>${item.title}</p>
        <small>x${item.count}</small>
      </div>
    `;

    cartItems.appendChild(div);
  });

  cartCounter.textContent = total;
}

// ===== РЕНДЕР ЛАЙКОВ =====
function renderFav() {
  favItems.innerHTML = '';

  Object.values(fav).forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';

    div.innerHTML = `
      <img src="${item.img}">
      <p>${item.title}</p>
    `;

    favItems.appendChild(div);
  });

  favCounter.textContent = Object.keys(fav).length;
}

// ===== ПЕРЕКЛЮЧЕНИЕ =====
const cartBtn = document.querySelector('.cart');
const favBtn = document.querySelector('.fav');
const cartPanel = document.querySelector('.cart-panel');
const favPanel = document.querySelector('.fav-panel');

cartBtn.onclick = () => {
  cartPanel.hidden = !cartPanel.hidden;
  favPanel.hidden = true;
};

favBtn.onclick = () => {
  favPanel.hidden = !favPanel.hidden;
  cartPanel.hidden = true;
};