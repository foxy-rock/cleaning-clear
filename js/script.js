/* ===================== ШАПКА ===================== */
const header = document.getElementById("header");
const toTop = document.getElementById("toTop");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
  toTop.classList.toggle("show", window.scrollY > 600);
});

toTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }),
);

/* ===================== МОБИЛЬНОЕ МЕНЮ ===================== */
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");

burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    burger.classList.remove("open");
    nav.classList.remove("open");
  });
});

/* ===================== АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ ===================== */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* ===================== КАЛЬКУЛЯТОР ===================== */
const calcState = { typePrice: 60, modeK: 1, area: 50, extras: [] };

function toggleGroup(groupId, onPick) {
  const group = document.getElementById(groupId);
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".calc__opt");
    if (!btn) return;
    group
      .querySelectorAll(".calc__opt")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    onPick(parseFloat(btn.dataset.price || btn.dataset.k));
    recalc();
  });
}

toggleGroup("calcType", (v) => (calcState.typePrice = v));
toggleGroup("calcMode", (v) => (calcState.modeK = v));

const areaInput = document.getElementById("area");
areaInput.addEventListener("input", () => {
  calcState.area = +areaInput.value;
  document.getElementById("areaVal").textContent = calcState.area + " м²";
  recalc();
});

document.querySelectorAll(".calc__extras input").forEach((cb) => {
  cb.addEventListener("change", () => {
    if (cb.checked) calcState.extras.push(+cb.dataset.price);
    else
      calcState.extras = calcState.extras.filter(
        (p) => p !== +cb.dataset.price,
      );
    recalc();
  });
});

function recalc() {
  const base = calcState.typePrice * calcState.area * calcState.modeK;
  const extras = calcState.extras.reduce((s, p) => s + p, 0);
  const total = Math.round((base + extras) / 50) * 50;
  document.getElementById("calcPrice").textContent =
    total.toLocaleString("ru-RU") + " ₽";
}

recalc();

/* ===================== СЛАЙДЕР ОТЗЫВОВ ===================== */
const track = document.getElementById("reviewsTrack");
const reviews = track.children.length;
const dotsBox = document.getElementById("sliderDots");
let current = 0;

for (let i = 0; i < reviews; i++) {
  const dot = document.createElement("button");
  if (i === 0) dot.classList.add("active");
  dot.addEventListener("click", () => goTo(i));
  dotsBox.appendChild(dot);
}

function perView() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 960) return 2;
  return 3;
}

function goTo(i) {
  const max = Math.max(0, reviews - perView());
  current = Math.min(Math.max(i, 0), max);
  const card = track.children[0];
  const gap = 22;
  const shift = current * (card.offsetWidth + gap);
  track.style.transform = `translateX(-${shift}px)`;
  dotsBox
    .querySelectorAll("button")
    .forEach((d, idx) => d.classList.toggle("active", idx === current));
}

document
  .getElementById("nextRev")
  .addEventListener("click", () => goTo(current + 1));
document
  .getElementById("prevRev")
  .addEventListener("click", () => goTo(current - 1));
window.addEventListener("resize", () => goTo(current));

/* Автопрокрутка */
setInterval(() => {
  const max = Math.max(0, reviews - perView());
  goTo(current >= max ? 0 : current + 1);
}, 6000);

/* ===================== ДО / ПОСЛЕ ===================== */
class BeforeAfter {
  constructor(container) {
    this.container = container;
    this.after = container.querySelector(".ba__after");
    this.handle = container.querySelector(".ba__handle");
    if (!this.after || !this.handle) return;

    this.dragging = false;
    this.pct = 50;
    this._apply();

    container.addEventListener("mousedown", this._start);
    container.addEventListener("touchstart", this._start, { passive: false });
    container.addEventListener("keydown", this._key);

    container.setAttribute("tabindex", "0");
    container.setAttribute("role", "slider");
    container.setAttribute("aria-valuemin", "0");
    container.setAttribute("aria-valuemax", "100");
    this._updateAria();
  }

  _getX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  _setFromX(clientX) {
    const rect = this.container.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    this.pct = Math.min(Math.max(pct, 0), 100);
    this._apply();
  }

  _apply() {
    this.after.style.width = this.pct + "%";
    this.handle.style.left = this.pct + "%";
    this._updateAria();
  }

  _updateAria() {
    this.container.setAttribute("aria-valuenow", Math.round(this.pct));
  }

  _start = (e) => {
    this.dragging = true;
    this._setFromX(this._getX(e));
    if (e.cancelable) e.preventDefault();

    document.addEventListener("mousemove", this._move);
    document.addEventListener("mouseup", this._stop);
    document.addEventListener("touchmove", this._move, { passive: false });
    document.addEventListener("touchend", this._stop);
    document.addEventListener("touchcancel", this._stop);
  };

  _move = (e) => {
    if (!this.dragging) return;
    this._setFromX(this._getX(e));
    if (e.cancelable) e.preventDefault();
  };

  _stop = () => {
    this.dragging = false;
    document.removeEventListener("mousemove", this._move);
    document.removeEventListener("mouseup", this._stop);
    document.removeEventListener("touchmove", this._move);
    document.removeEventListener("touchend", this._stop);
    document.removeEventListener("touchcancel", this._stop);
  };

  _key = (e) => {
    const step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowLeft") {
      this.pct = Math.max(0, this.pct - step);
      this._apply();
      e.preventDefault();
    }
    if (e.key === "ArrowRight") {
      this.pct = Math.min(100, this.pct + step);
      this._apply();
      e.preventDefault();
    }
    if (e.key === "Home") {
      this.pct = 0;
      this._apply();
      e.preventDefault();
    }
    if (e.key === "End") {
      this.pct = 100;
      this._apply();
      e.preventDefault();
    }
  };
}

document.querySelectorAll(".ba").forEach((el) => new BeforeAfter(el));

/* ===================== ФОРМА ЗАЯВКИ ===================== */
const form = document.getElementById("orderForm");
const phoneInput = document.getElementById("phone");

/* Маска телефона */
phoneInput.addEventListener("input", () => {
  let d = phoneInput.value.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  let res = "+7";
  if (d.length > 1) res += " (" + d.slice(1, 4);
  if (d.length >= 5) res += ") " + d.slice(4, 7);
  if (d.length >= 8) res += "-" + d.slice(7, 9);
  if (d.length >= 10) res += "-" + d.slice(9, 11);
  phoneInput.value = res;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name");
  let valid = true;

  [name, phoneInput].forEach((f) => f.classList.remove("error"));

  if (name.value.trim().length < 2) {
    name.classList.add("error");
    valid = false;
  }
  if (phoneInput.value.replace(/\D/g, "").length < 11) {
    phoneInput.classList.add("error");
    valid = false;
  }

  if (!valid) return;

  const success = document.getElementById("orderSuccess");
  success.classList.add("show");
  form.reset();
  setTimeout(() => success.classList.remove("show"), 5000);
});
