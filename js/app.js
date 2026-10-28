// =====================================================================
// College Canteen Pre-Order System - app.js (simple version)
// One file used by all 6 pages. Each page's <body> has data-page="...",
// and the code at the bottom runs only the setup for that page.
//
// Sections: 1 Data | 2 Storage helpers | 3 Cart | 4 Queue | 5 Orders
//           6 Menu + Home | 7 Cart page | 8 Checkout | 9 History
//           10 Dashboard | 11 Dark mode | 12 Start
// =====================================================================

// ---------- 1. DATA ----------
const TAX_RATE = 0.05; // 5% tax
const MAX_QTY = 10;    // most of one item per order

const MENU = [
  { id: 1,  name: "Samosa",          category: "Snacks",    price: 15, image: "assets/food-images/samosa.jpg",        description: "Crispy pastry with spiced potato.", special: true },
  { id: 2,  name: "Veg Sandwich",    category: "Snacks",    price: 40, image: "assets/food-images/veg-sandwich.jpg",  description: "Grilled with veggies and chutney." },
  { id: 3,  name: "French Fries",    category: "Snacks",    price: 60, image: "assets/food-images/french-fries.jpg",  description: "Golden fries with masala." },
  { id: 4,  name: "Veg Puff",        category: "Snacks",    price: 20, image: "assets/food-images/veg-puff.jpg",      description: "Flaky pastry with vegetable filling." },
  { id: 5,  name: "Masala Dosa",     category: "Meals",     price: 70, image: "assets/food-images/masala-dosa.jpg",   description: "Crispy dosa with sambar and chutney.", special: true },
  { id: 6,  name: "Veg Thali",       category: "Meals",     price: 90, image: "assets/food-images/veg-thali.jpg",     description: "Roti, rice, dal, sabzi and salad.", special: true },
  { id: 7,  name: "Chole Bhature",   category: "Meals",     price: 80, image: "assets/food-images/chole-bhature.jpg", description: "Spicy chickpeas with fluffy bhature." },
  { id: 8,  name: "Veg Fried Rice",  category: "Meals",     price: 75, image: "assets/food-images/fried-rice.jpg",    description: "Wok-tossed rice with vegetables." },
  { id: 9,  name: "Masala Chai",     category: "Beverages", price: 12, image: "assets/food-images/masala-chai.jpg",   description: "Hot tea with ginger and cardamom.", special: true },
  { id: 10, name: "Cold Coffee",     category: "Beverages", price: 45, image: "assets/food-images/cold-coffee.jpg",   description: "Chilled and creamy." },
  { id: 11, name: "Fresh Lime Soda", category: "Beverages", price: 25, image: "assets/food-images/lime-soda.jpg",     description: "Sweet or salted." },
  { id: 12, name: "Mango Shake",     category: "Beverages", price: 50, image: "assets/food-images/mango-shake.jpg",   description: "Thick shake with ripe mangoes." },
  { id: 13, name: "Gulab Jamun",     category: "Desserts",  price: 30, image: "assets/food-images/gulab-jamun.jpg",   description: "Two dumplings in sugar syrup." },
  { id: 14, name: "Ice Cream Cup",   category: "Desserts",  price: 35, image: "assets/food-images/ice-cream.jpg",     description: "Vanilla, chocolate or strawberry." },
  { id: 15, name: "Brownie",         category: "Desserts",  price: 50, image: "assets/food-images/brownie.jpg",       description: "Warm chocolate brownie." }
];

// ---------- 2. STORAGE + SMALL HELPERS ----------
// localStorage only stores text, so we convert with JSON.stringify / JSON.parse.
function getData(key, fallback) {
  try {
    const text = localStorage.getItem(key);
    return text ? JSON.parse(text) : fallback;
  } catch (error) {
    return fallback; // saved data was broken
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatPrice(amount) {
  return "₹" + amount.toFixed(2);
}

function randomNumber(min, max) { // whole number from min to max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showToast(message, type) { // small popup message
  const toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  toast.textContent = message;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// ---------- 3. CART ----------
// The cart is an array like [ { id: 5, qty: 2 }, { id: 9, qty: 1 } ].
// Only id and qty are saved; name and price come from MENU.
function getCart() {
  return getData("canteen_cart", []);
}

function saveCart(cart) {
  saveData("canteen_cart", cart);
  updateCartBadge();
}

function addToCart(id) {
  const cart = getCart();
  const line = cart.find(l => l.id === id);
  if (line && line.qty >= MAX_QTY) {
    showToast("Maximum " + MAX_QTY + " of one item.", "error");
    return;
  }
  if (line) line.qty++;
  else cart.push({ id: id, qty: 1 });
  saveCart(cart);
  showToast("Added to cart", "success");
}

// amount is +1 (increase) or -1 (decrease). Quantity 0 removes the item.
function changeQty(id, amount) {
  const cart = getCart();
  const line = cart.find(l => l.id === id);
  if (line.qty + amount > MAX_QTY) return showToast("Maximum " + MAX_QTY + " per item.", "error");
  line.qty += amount;
  saveCart(cart.filter(l => l.qty > 0));
}

function removeItem(id) {
  saveCart(getCart().filter(l => l.id !== id));
}

// Cart lines joined with menu details (name, price, image) for showing on screen.
function getCartItems() {
  return getCart().map(line => {
    const food = MENU.find(m => m.id === line.id);
    return { id: food.id, name: food.name, price: food.price, image: food.image, qty: line.qty };
  });
}

function getTotals() {
  let subtotal = 0;
  getCartItems().forEach(item => { subtotal += item.price * item.qty; });
  const tax = subtotal * TAX_RATE;
  return { subtotal: subtotal, tax: tax, total: subtotal + tax };
}

function updateCartBadge() {
  let count = 0;
  getCart().forEach(line => { count += line.qty; });
  document.getElementById("cart-count").textContent = count;
  const floating = document.getElementById("floating-cart-count"); // only on the menu page
  if (floating) floating.textContent = count;
}

// Write subtotal, tax and total into three elements (used by Cart and Checkout pages).
function showTotals(subtotalId, taxId, totalId) {
  const totals = getTotals();
  document.getElementById(subtotalId).textContent = formatPrice(totals.subtotal);
  document.getElementById(taxId).textContent = formatPrice(totals.tax);
  document.getElementById(totalId).textContent = formatPrice(totals.total);
}

// <li> rows for a list of items (used by Checkout, Confirmation and the History popup).
function itemRowsHTML(items) {
  return items.map(i =>
    `<li><span>${i.name} × ${i.qty}</span><span>${formatPrice(i.price * i.qty)}</span></li>`
  ).join("");
}

// ---------- 4. LIVE QUEUE ESTIMATOR ----------
// We pretend there is a queue. The number of orders ahead is saved in localStorage.
// Waiting time = orders ahead x 2 minutes (example: 8 ahead = 16 minutes).
function getOrdersAhead() {
  let ahead = getData("canteen_queue", null);
  if (typeof ahead !== "number") {        // first visit: make a random queue (1 to 15)
    ahead = randomNumber(1, 15);
    saveData("canteen_queue", ahead);
  }
  return ahead;
}

function getWaitTime(ordersAhead) {
  return ordersAhead * 2;
}

function getPickupTime(waitMinutes) { // time now + waiting time, e.g. "3:45 PM"
  const time = new Date(Date.now() + waitMinutes * 60000);
  return time.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }).toUpperCase();
}

function showQueue() {
  if (!document.getElementById("orders-ahead")) return; // this page has no queue box
  const ahead = getOrdersAhead();
  const wait = getWaitTime(ahead);

  document.getElementById("orders-ahead").textContent = ahead;
  document.getElementById("wait-time").textContent = wait;
  document.getElementById("pickup-time").textContent = getPickupTime(wait);

  // Badge colour: 1-5 quiet, 6-10 busy, more than 10 very busy
  const badge = document.getElementById("queue-status");
  if (ahead <= 5) { badge.textContent = "Quiet"; badge.className = "status-badge status-low"; }
  else if (ahead <= 10) { badge.textContent = "Getting busy"; badge.className = "status-badge status-medium"; }
  else { badge.textContent = "Very busy"; badge.className = "status-badge status-high"; }
}

function startQueue() {
  showQueue();
  // Every 20 seconds there is a 50% chance that one order finishes.
  setInterval(() => {
    const ahead = getOrdersAhead();
    if (ahead > 1 && Math.random() < 0.5) saveData("canteen_queue", ahead - 1);
    showQueue();
  }, 20000);
}

// ---------- 5. ORDERS ----------
function getOrders() {
  return getData("canteen_orders", []);
}

// Order tokens: CNT1001, CNT1002, ... A counter in localStorage keeps going up.
function nextToken() {
  const number = getData("canteen_orderCounter", 1000) + 1;
  saveData("canteen_orderCounter", number);
  return "CNT" + number;
}

function createOrder(form) {
  const totals = getTotals();
  const ahead = getOrdersAhead();
  const order = {
    orderId: nextToken(),
    date: new Date().toISOString(),   // date and time stamp
    customer: { name: form.name, studentId: form.studentId, phone: form.phone },
    items: getCartItems(),            // a copy, so later menu changes don't affect old orders
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    paymentMode: form.payment,
    pickupSlot: form.pickupSlot,
    status: "Preparing",
    ordersAhead: ahead,               // queue information at the time of ordering
    estimatedWait: getWaitTime(ahead),
    pickupTime: getPickupTime(getWaitTime(ahead))
  };

  const orders = getOrders();
  orders.push(order);
  saveData("canteen_orders", orders);

  saveData("canteen_queue", ahead + 1); // this order joins the queue
  saveCart([]);                         // empty the cart
  return order;
}

// ---------- 6. MENU + HOME PAGE ----------
function foodCardHTML(food) {
  return `<article class="food-card" data-id="${food.id}">
    <img class="food-img" src="${food.image}" alt="${food.name}" onerror="this.style.visibility='hidden'">
    <div class="food-body">
      <span class="food-category">${food.category}</span>
      <h3 class="food-name">${food.name}</h3>
      <p class="food-desc">${food.description}</p>
      <div class="food-footer">
        <span class="food-price">${formatPrice(food.price)}</span>
        <button type="button" class="btn btn-primary add-to-cart-btn">Add to cart</button>
      </div>
    </div>
  </article>`;
}

// One click listener on the whole grid handles every "Add to cart" button.
function listenForAddToCart(grid) {
  grid.addEventListener("click", event => {
    const button = event.target.closest(".add-to-cart-btn");
    if (button) addToCart(Number(button.closest(".food-card").dataset.id));
  });
}

function initHome() {
  const grid = document.getElementById("specials-grid");
  grid.innerHTML = MENU.filter(food => food.special).map(foodCardHTML).join("");
  listenForAddToCart(grid);
}

function initMenu() {
  const grid = document.getElementById("menu-grid");
  const search = document.getElementById("menu-search");
  const buttons = document.querySelectorAll(".filter-btn");
  let category = "all";

  function showFoods() {
    const text = search.value.trim().toLowerCase();
    const foods = MENU.filter(food =>
      (category === "all" || food.category === category) && food.name.toLowerCase().includes(text)
    );
    grid.innerHTML = foods.map(foodCardHTML).join("");
    document.getElementById("menu-empty").hidden = foods.length > 0;
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      category = button.dataset.category;
      showFoods();
    });
  });
  search.addEventListener("input", showFoods);
  document.getElementById("reset-filters-btn").addEventListener("click", () => {
    search.value = "";
    buttons[0].click(); // click "All"
  });

  listenForAddToCart(grid);
  showFoods();
}

// ---------- 7. CART PAGE ----------
function renderCart() {
  const items = getCartItems();
  const isEmpty = items.length === 0;
  document.getElementById("cart-table").hidden = isEmpty;
  document.getElementById("cart-empty").hidden = !isEmpty;
  document.getElementById("clear-cart-btn").hidden = isEmpty;

  document.getElementById("cart-items").innerHTML = items.map(item => `<tr>
    <td><div class="cart-item-info"><img class="cart-thumb" src="${item.image}" alt="" onerror="this.style.visibility='hidden'"><span>${item.name}</span></div></td>
    <td>${formatPrice(item.price)}</td>
    <td><div class="qty-controls">
      <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
      <span class="qty-value">${item.qty}</span>
      <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
    </div></td>
    <td>${formatPrice(item.price * item.qty)}</td>
    <td><button type="button" class="remove-btn" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">✕</button></td>
  </tr>`).join("");

  showTotals("subtotal", "tax", "total");
}

function initCart() {
  // One listener on the table handles every +, - and remove button.
  document.getElementById("cart-items").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = Number(button.dataset.id);
    if (button.dataset.action === "increase") changeQty(id, 1);
    if (button.dataset.action === "decrease") changeQty(id, -1);
    if (button.dataset.action === "remove") removeItem(id);
    renderCart();
  });

  document.getElementById("clear-cart-btn").addEventListener("click", () => {
    if (confirm("Remove all items from your cart?")) {
      saveCart([]);
      renderCart();
    }
  });

  document.getElementById("checkout-btn").addEventListener("click", event => {
    if (getCart().length === 0) {
      event.preventDefault(); // stay on this page
      showToast("Add something to your cart first.", "error");
    }
  });

  renderCart();
}

// ---------- 8. CHECKOUT PAGE ----------
function initCheckout() {
  if (getCart().length === 0) {
    window.location.href = "menu.html"; // nothing to check out
    return;
  }
  document.getElementById("checkout-items").innerHTML = itemRowsHTML(getCartItems());
  showTotals("checkout-subtotal", "checkout-tax", "checkout-total");

  // Pickup slots: "As soon as ready", then every 15 minutes from 10:00 AM to 4:00 PM
  // (slots that have already passed are skipped).
  const select = document.getElementById("pickup-slot");
  select.add(new Option("As soon as ready", "As soon as ready"));
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (let minutes = 10 * 60; minutes <= 16 * 60; minutes += 15) {
    if (minutes <= nowMinutes) continue;
    const hour = Math.floor(minutes / 60);
    const label = (hour > 12 ? hour - 12 : hour) + ":" + String(minutes % 60).padStart(2, "0") + (hour >= 12 ? " PM" : " AM");
    select.add(new Option(label, label));
  }

  document.getElementById("checkout-form").addEventListener("submit", handleCheckout);
}

// Returns an object of error messages. An empty object means the form is valid.
function validateForm(data) {
  const errors = {};
  if (!/^[A-Za-z][A-Za-z .'-]{1,49}$/.test(data.name)) errors.name = "Enter your full name (letters only).";
  if (!/^[A-Za-z0-9]{4,15}$/.test(data.studentId)) errors.studentId = "Enter a valid student ID (4 to 15 letters or digits).";
  if (!/^[6-9][0-9]{9}$/.test(data.phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  if (!data.pickupSlot) errors.pickupSlot = "Choose a pickup time slot.";
  return errors;
}

function handleCheckout(event) {
  event.preventDefault(); // stop the page from reloading
  if (getCart().length === 0) { window.location.href = "menu.html"; return; }

  const data = {
    name: document.getElementById("customer-name").value.trim(),
    studentId: document.getElementById("student-id").value.trim(),
    phone: document.getElementById("customer-phone").value.trim(),
    pickupSlot: document.getElementById("pickup-slot").value,
    payment: document.querySelector('input[name="payment"]:checked').value
  };

  // Show an error under each wrong field: [message element id, input element id]
  const errors = validateForm(data);
  const fields = {
    name: ["name-error", "customer-name"],
    studentId: ["student-id-error", "student-id"],
    phone: ["phone-error", "customer-phone"],
    pickupSlot: ["slot-error", "pickup-slot"]
  };
  for (const field in fields) {
    document.getElementById(fields[field][0]).textContent = errors[field] || "";
    document.getElementById(fields[field][1]).classList.toggle("invalid", Boolean(errors[field]));
  }
  if (Object.keys(errors).length > 0) {
    showToast("Please fix the highlighted fields.", "error");
    return;
  }

  showConfirmation(createOrder(data));
}

function showConfirmation(order) {
  document.getElementById("confirm-name").textContent = order.customer.name;
  document.getElementById("confirm-order-id").textContent = order.orderId;
  document.getElementById("confirm-time").textContent = new Date(order.date).toLocaleString("en-IN");
  document.getElementById("confirm-slot").textContent = order.pickupSlot;
  document.getElementById("confirm-payment").textContent = order.paymentMode;
  document.getElementById("confirm-orders-ahead").textContent = order.ordersAhead;
  document.getElementById("confirm-wait").textContent = order.estimatedWait;
  document.getElementById("confirm-pickup-time").textContent = order.pickupTime;
  document.getElementById("confirm-total").textContent = formatPrice(order.total);
  document.getElementById("confirm-items").innerHTML = itemRowsHTML(order.items);

  document.getElementById("checkout-section").hidden = true;
  document.getElementById("confirmation-section").hidden = false;
  window.scrollTo(0, 0);
  showToast("Order placed!", "success");
}

// ---------- 9. HISTORY PAGE ----------
function renderHistory() {
  // Newest first: sort() compares two dates; a positive result puts b before a.
  const orders = getOrders().sort((a, b) => new Date(b.date) - new Date(a.date));
  let spent = 0;
  orders.forEach(order => { spent += order.total; });

  document.getElementById("history-total-orders").textContent = orders.length;
  document.getElementById("history-total-spent").textContent = formatPrice(spent);
  document.getElementById("history-table").hidden = orders.length === 0;
  document.getElementById("history-empty").hidden = orders.length > 0;
  document.getElementById("clear-history-btn").hidden = orders.length === 0;

  document.getElementById("history-body").innerHTML = orders.map(order => `<tr>
    <td><strong>${order.orderId}</strong></td>
    <td>${new Date(order.date).toLocaleString("en-IN")}</td>
    <td>${order.items.map(i => i.name + " ×" + i.qty).join(", ")}</td>
    <td>${formatPrice(order.total)}</td>
    <td><span class="order-status">${order.status}</span></td>
    <td><button type="button" class="btn btn-secondary" data-id="${order.orderId}">View</button></td>
  </tr>`).join("");
}

function showOrderDetails(token) {
  const order = getOrders().find(o => o.orderId === token);
  document.getElementById("modal-body").innerHTML = `
    <dl class="summary-list">
      <div class="summary-row"><dt>Order ID</dt><dd>${order.orderId}</dd></div>
      <div class="summary-row"><dt>Placed on</dt><dd>${new Date(order.date).toLocaleString("en-IN")}</dd></div>
      <div class="summary-row"><dt>Name</dt><dd>${order.customer.name} (${order.customer.studentId})</dd></div>
      <div class="summary-row"><dt>Pickup slot</dt><dd>${order.pickupSlot}</dd></div>
      <div class="summary-row"><dt>Payment</dt><dd>${order.paymentMode}</dd></div>
    </dl>
    <ul class="summary-items">${itemRowsHTML(order.items)}</ul>
    <dl class="summary-list">
      <div class="summary-row"><dt>Subtotal</dt><dd>${formatPrice(order.subtotal)}</dd></div>
      <div class="summary-row"><dt>Tax</dt><dd>${formatPrice(order.tax)}</dd></div>
      <div class="summary-row summary-total"><dt>Total</dt><dd>${formatPrice(order.total)}</dd></div>
    </dl>`;
  document.getElementById("order-modal").showModal();
}

function initHistory() {
  document.getElementById("history-body").addEventListener("click", event => {
    const button = event.target.closest("button[data-id]");
    if (button) showOrderDetails(button.dataset.id);
  });
  document.getElementById("modal-close-btn").addEventListener("click", () => {
    document.getElementById("order-modal").close();
  });
  document.getElementById("clear-history-btn").addEventListener("click", () => {
    if (confirm("Delete your whole order history?")) {
      saveData("canteen_orders", []);
      renderHistory();
    }
  });
  renderHistory();
}

// ---------- 10. DASHBOARD (Chart.js) ----------
let barChart = null;  // kept so we can destroy the old chart before drawing a new one
let pieChart = null;

function drawChart(oldChart, canvasId, type, labels, values) {
  if (oldChart) oldChart.destroy();
  Chart.defaults.color = getComputedStyle(document.body).color; // text colour for light/dark mode
  return new Chart(document.getElementById(canvasId), {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ["#f2b632", "#2f6fba", "#1f8a4c", "#a82233", "#7a4fb5", "#e07b39", "#4cb5ae", "#8a94b8"]
      }]
    },
    options: { plugins: { legend: { display: type === "pie" } } } // legend only for the pie chart
  });
}

function showDashboard() {
  const orders = getOrders();
  let revenue = 0;
  const itemCounts = {};                // { "Samosa": 12, "Masala Chai": 9, ... }
  const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // orders on Sunday ... Saturday

  orders.forEach(order => {
    revenue += order.total;
    dayCounts[new Date(order.date).getDay()]++;
    order.items.forEach(item => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
    });
  });

  // Foods sorted by quantity, biggest first
  const topItems = Object.keys(itemCounts)
    .map(name => ({ name: name, qty: itemCounts[name] }))
    .sort((a, b) => b.qty - a.qty);

  document.getElementById("stat-orders").textContent = orders.length;
  document.getElementById("stat-revenue").textContent = formatPrice(revenue);
  document.getElementById("stat-average").textContent = formatPrice(orders.length ? revenue / orders.length : 0);
  document.getElementById("stat-top-item").textContent = topItems.length ? topItems[0].name : "None yet";
  document.getElementById("top-items-list").innerHTML = topItems.slice(0, 5)
    .map(item => `<li><span>${item.name}</span><strong>${item.qty} sold</strong></li>`).join("");

  const isEmpty = orders.length === 0;
  document.getElementById("dashboard-empty").hidden = !isEmpty;
  document.getElementById("charts-section").hidden = isEmpty;
  document.getElementById("top-items-section").hidden = isEmpty;
  if (isEmpty || typeof Chart === "undefined") return; // Chart.js needs internet (CDN)

  // Bar chart: the 8 most ordered foods
  const top8 = topItems.slice(0, 8);
  barChart = drawChart(barChart, "salesChart", "bar", top8.map(i => i.name), top8.map(i => i.qty));

  // Pie chart: orders per weekday (days with no orders are left out)
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const labels = days.filter((day, i) => dayCounts[i] > 0);
  const values = dayCounts.filter(count => count > 0);
  pieChart = drawChart(pieChart, "categoryChart", "pie", labels, values);
}

// Adds 25 fake orders from the last 7 days, so the charts have data to show.
function makeDemoData() {
  const orders = getOrders();
  for (let i = 0; i < 25; i++) {
    const date = new Date();
    date.setDate(date.getDate() - randomNumber(0, 6));
    date.setHours(randomNumber(10, 15), randomNumber(0, 59));

    const food = MENU[randomNumber(0, MENU.length - 1)];
    const qty = randomNumber(1, 3);
    const subtotal = food.price * qty;
    orders.push({
      orderId: nextToken(), date: date.toISOString(),
      customer: { name: "Demo Student", studentId: "DEMO1234", phone: "9000000000" },
      items: [{ id: food.id, name: food.name, price: food.price, qty: qty }],
      subtotal: subtotal, tax: subtotal * TAX_RATE, total: subtotal * (1 + TAX_RATE),
      paymentMode: "Cash at counter", pickupSlot: "12:00 PM", status: "Completed"
    });
  }
  saveData("canteen_orders", orders);
  showToast("25 demo orders added.", "success");
}

function initDashboard() {
  document.getElementById("demo-data-btn").addEventListener("click", () => {
    makeDemoData();
    showDashboard();
  });
  showDashboard();
}

// ---------- 11. DARK MODE ----------
// The CSS has a second set of colours used when <html> has data-theme="dark".
// We save the choice in localStorage so it stays after a refresh.
// (Each page also has a one-line script in <head> that applies it before the page shows.)
function applyTheme(theme) {
  if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  document.getElementById("theme-toggle").textContent = theme === "dark" ? "☀️" : "🌙";
}

function initTheme() {
  applyTheme(localStorage.getItem("canteen_theme"));
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const newTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem("canteen_theme", newTheme);
    if (document.body.dataset.page === "dashboard") showDashboard(); // redraw charts in new colours
  });
}

// ---------- 12. START ----------
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  updateCartBadge();

  // Mobile menu button
  document.getElementById("nav-toggle").addEventListener("click", () => {
    document.getElementById("nav-links").classList.toggle("open");
  });

  // Run the setup for the current page
  const page = document.body.dataset.page;
  if (page === "index") initHome();
  if (page === "menu") initMenu();
  if (page === "cart") initCart();
  if (page === "checkout") initCheckout();
  if (page === "history") initHistory();
  if (page === "dashboard") initDashboard();

  startQueue(); // does nothing on pages without a queue box
});
