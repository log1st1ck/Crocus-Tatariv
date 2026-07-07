// Google Apps Script URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxy2eCBHC4RbZu-yKDtef2XrYlBHjCkOYn4b0-4qr1aVIMxCxPg6cxoOWSJkPduwW2xkA/exec";

// Слайдер для фото номера
const slides = document.querySelectorAll(".slide");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");

let current = 0;

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove("active"));

  if (slides.length > 0) {
    slides[index].classList.add("active");
  }
}

if (next && prev && slides.length > 0) {
  next.addEventListener("click", () => {
    current = (current + 1) % slides.length;
    showSlide(current);
  });

  prev.addEventListener("click", () => {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  });

  showSlide(current);
}

// Легкий паралакс для hero-фото.
const heroSection = document.querySelector(".hero");
const reduceMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
let heroParallaxTicking = false;

function updateHeroParallax() {
  heroParallaxTicking = false;

  if (!heroSection || reduceMotionMedia.matches) return;

  const rect = heroSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  if (rect.bottom < 0 || rect.top > viewportHeight) return;

  const parallaxOffset = Math.max(-120, Math.min(120, Math.round(rect.top * -0.16)));
  heroSection.style.setProperty("--hero-parallax-y", `${parallaxOffset}px`);
}

function requestHeroParallaxUpdate() {
  if (heroParallaxTicking) return;

  heroParallaxTicking = true;
  window.requestAnimationFrame(updateHeroParallax);
}

if (heroSection) {
  updateHeroParallax();
  window.addEventListener("scroll", requestHeroParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestHeroParallaxUpdate);
}

// Відправка в Google Таблицю
function sendBookingToGoogle(data) {
  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).catch(error => {
    console.log("Google Sheets error:", error);
  });
}

function getDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function sanitizeName(value) {
  return String(value || "").replace(/[^A-Za-zА-Яа-яІіЇїЄєҐґ\s]/g, "");
}

function sanitizePhone(value) {
  return getDigits(value).slice(0, 15);
}

function getFieldValue(field) {
  if (!field) return "";

  if ("value" in field) {
    return field.value.trim();
  }

  return field.textContent.trim();
}

function parseBookingDate(value) {
  const parts = String(value || "").split(".").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }

  const [day, month, year] = parts;
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function clearFieldError(field) {
  if (!field || !field.id) return;

  field.classList.remove("is-invalid");

  const error = document.querySelector(`[data-error-for="${field.id}"]`);
  if (error) {
    error.remove();
  }
}

function setFieldError(field, message) {
  if (!field || !field.id) return;

  clearFieldError(field);
  field.classList.add("is-invalid");

  const error = document.createElement("div");
  error.className = "field-error";
  error.dataset.errorFor = field.id;
  error.textContent = message;

  field.insertAdjacentElement("afterend", error);
}

function validateBookingFields(fields) {
  let isValid = true;
  const name = getFieldValue(fields.name);
  const phone = getFieldValue(fields.phone);
  const dateFrom = getFieldValue(fields.dateFrom);
  const dateTo = getFieldValue(fields.dateTo);
  const room = getFieldValue(fields.room);
  const guests = getFieldValue(fields.guests);
  const guestCount = Number(getDigits(guests));

  Object.values(fields).forEach(clearFieldError);

  if (name.length < 2) {
    setFieldError(fields.name, "Вкажіть ім'я, мінімум 2 символи.");
    isValid = false;
  }

  if (name !== sanitizeName(name)) {
    setFieldError(fields.name, "Ім'я має містити тільки літери.");
    isValid = false;
  }

  const phoneDigits = getDigits(phone);
  if (phone !== phoneDigits) {
    setFieldError(fields.phone, "Телефон має містити тільки цифри.");
    isValid = false;
  }

  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    setFieldError(fields.phone, "Вкажіть коректний номер телефону.");
    isValid = false;
  }

  const parsedDateFrom = parseBookingDate(dateFrom);
  const parsedDateTo = parseBookingDate(dateTo);

  if (!parsedDateFrom) {
    setFieldError(fields.dateFrom, "Оберіть дату заїзду.");
    isValid = false;
  }

  if (!parsedDateTo) {
    setFieldError(fields.dateTo, "Оберіть дату виїзду.");
    isValid = false;
  }

  if (parsedDateFrom && parsedDateTo && parsedDateTo <= parsedDateFrom) {
    setFieldError(fields.dateTo, "Дата виїзду має бути пізніше за дату заїзду.");
    isValid = false;
  }

  if (!room) {
    setFieldError(fields.room, "Оберіть тип номеру.");
    isValid = false;
  }

  if (!guestCount || guestCount < 1 || guestCount > 48) {
    setFieldError(fields.guests, "Вкажіть кількість гостей від 1 до 48.");
    isValid = false;
  }

  return isValid;
}

function collectBookingData(fields, source) {
  return {
    name: getFieldValue(fields.name),
    phone: getFieldValue(fields.phone),
    dateFrom: getFieldValue(fields.dateFrom),
    dateTo: getFieldValue(fields.dateTo),
    room: getFieldValue(fields.room),
    guests: getFieldValue(fields.guests),
    source
  };
}

function clearBookingFields(fields) {
  Object.values(fields).forEach(field => {
    clearFieldError(field);
    if ("value" in field) {
      field.value = "";
    }
  });
}

function sendTelegram() {
  const fields = {
    name: document.getElementById("name"),
    phone: document.getElementById("phone"),
    dateFrom: document.getElementById("dateFrom"),
    dateTo: document.getElementById("dateTo"),
    room: document.getElementById("room"),
    guests: document.getElementById("guests")
  };

  if (!validateBookingFields(fields)) return;

  sendBookingToGoogle(collectBookingData(fields, "bottom-form"));
  clearBookingFields(fields);
  showSuccessModal();
}

// Відправка заявки в Telegram + Google Таблицю
function sendTelegramModal() {
  const fields = {
    name: document.getElementById("modalName"),
    phone: document.getElementById("modalPhone"),
    dateFrom: document.getElementById("modalDateFrom"),
    dateTo: document.getElementById("modalDateTo"),
    room: document.getElementById("modalRoom"),
    guests: document.getElementById("guestCount")
  };

  if (!validateBookingFields(fields)) return;

  sendBookingToGoogle(collectBookingData(fields, "pop-up"));
  document.getElementById("bookingModal").classList.remove("active");
  clearBookingFields({
    name: fields.name,
    phone: fields.phone,
    dateFrom: fields.dateFrom,
    dateTo: fields.dateTo,
    room: fields.room
  });
  modalGuests = 1;
  fields.guests.textContent = "1";
  showSuccessModal();
}

[
  "name",
  "phone",
  "dateFrom",
  "dateTo",
  "room",
  "guests",
  "modalName",
  "modalPhone",
  "modalDateFrom",
  "modalDateTo",
  "modalRoom"
].forEach(id => {
  const field = document.getElementById(id);

  if (!field) return;

  field.addEventListener("input", () => {
    if (id === "name" || id === "modalName") {
      field.value = sanitizeName(field.value);
    }

    if (id === "phone" || id === "modalPhone") {
      field.value = sanitizePhone(field.value);
    }

    clearFieldError(field);
  });
  field.addEventListener("change", () => clearFieldError(field));
});

 

// Анімація і pop-up бронювання
const bookingModal = document.getElementById("bookingModal");
const closeBooking = document.getElementById("closeBooking");
const openBookingButtons = document.querySelectorAll(".openBooking");

function selectBookingRoom(room) {
  const modalRoom = document.getElementById("modalRoom");

  if (!modalRoom || !room) return;

  modalRoom.value = room;

  if (modalRoom.value === room) return;

  const matchingOption = Array.from(modalRoom.options).find(option => {
    const optionText = option.textContent.trim();

    return optionText.includes(room) || room.includes(optionText.split(" (")[0]);
  });

  if (matchingOption) {
    modalRoom.value = matchingOption.value;
  }
}

openBookingButtons.forEach(button => {
  button.addEventListener("click", event => {
    event.stopPropagation();

    if (!bookingModal) return;

    if (typeof closeRoomGallery === "function") {
      closeRoomGallery();
    }

    bookingModal.classList.add("active");

    startCalendar();

    const room = button.dataset.room;
    if (room) {
      selectBookingRoom(room);
    }
  });
});

if (closeBooking) {
  closeBooking.addEventListener("click", () => {
    bookingModal.classList.remove("active");
  });
}

if (bookingModal) {
  bookingModal.addEventListener("click", e => {
    if (e.target === bookingModal) {
      bookingModal.classList.remove("active");
    }
  });
}

// Бургер-меню на телефоні
const mainHeader = document.querySelector(".main-header");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const mobileMenu = document.getElementById("mobileMenu");

function closeMobileMenu() {
  if (!mainHeader || !mobileMenuToggle) return;

  mainHeader.classList.remove("is-menu-open");
  mobileMenuToggle.setAttribute("aria-expanded", "false");
}

function toggleMobileMenu() {
  if (!mainHeader || !mobileMenuToggle) return;

  const isOpen = mainHeader.classList.toggle("is-menu-open");
  mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
}

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener("click", event => {
    event.stopPropagation();
    toggleMobileMenu();
  });
}

if (mobileMenu) {
  mobileMenu.querySelectorAll("a, button").forEach(item => {
    item.addEventListener("click", closeMobileMenu);
  });
}

document.addEventListener("click", event => {
  if (!mainHeader || !mainHeader.classList.contains("is-menu-open")) return;
  if (mainHeader.contains(event.target)) return;

  closeMobileMenu();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    closeMobileMenu();
  }
});

// Кількість гостей у pop-up
const minusGuest = document.getElementById("minusGuest");
const plusGuest = document.getElementById("plusGuest");
const guestCount = document.getElementById("guestCount");

let modalGuests = 1;

if (plusGuest && minusGuest && guestCount) {
  plusGuest.addEventListener("click", () => {
    if (modalGuests < 10) {
      modalGuests++;
      guestCount.textContent = modalGuests;
    }
  });

  minusGuest.addEventListener("click", () => {
    if (modalGuests > 1) {
      modalGuests--;
      guestCount.textContent = modalGuests;
    }
  });
}

// Календар у pop-up
let calendarStarted = false;

function startCalendar() {
  if (calendarStarted) return;

  if (typeof flatpickr === "undefined") {
    alert("Flatpickr не підключився. Перевір script у HTML.");
    return;
  }

  const checkOut = flatpickr("#modalDateTo", {
    locale: "uk",
    dateFormat: "d.m.Y",
    minDate: "today",
    disableMobile: true
  });

  flatpickr("#modalDateFrom", {
    locale: "uk",
    dateFormat: "d.m.Y",
    minDate: "today",
    disableMobile: true,
    onChange: function (selectedDates) {
      if (selectedDates.length > 0) {
        checkOut.set("minDate", selectedDates[0]);
        checkOut.open();
      }
    }
  });

  calendarStarted = true;
}

// Календар у нижній формі
document.addEventListener("DOMContentLoaded", function () {
  if (typeof flatpickr !== "undefined") {
    const bottomDateTo = flatpickr("#dateTo", {
      locale: "uk",
      dateFormat: "d.m.Y",
      minDate: "today",
      disableMobile: true
    });

    flatpickr("#dateFrom", {
      locale: "uk",
      dateFormat: "d.m.Y",
      minDate: "today",
      disableMobile: true,
      onChange: function (selectedDates) {
        if (selectedDates.length > 0) {
          bottomDateTo.set("minDate", selectedDates[0]);
          bottomDateTo.open();
        }
      }
    });
  }
});
function showSuccessModal() {
  const successModal = document.getElementById("successModal");

  if (successModal) {
    successModal.classList.add("active");
  }
}

const closeSuccessModal = document.getElementById("closeSuccessModal");

if (closeSuccessModal) {
  closeSuccessModal.addEventListener("click", () => {
    document.getElementById("successModal").classList.remove("active");
  });
}

const successModal = document.getElementById("successModal");

if (successModal) {
  successModal.addEventListener("click", (e) => {
    if (e.target === successModal) {
      successModal.classList.remove("active");
    }
  });
}

const roomGalleries = {
  standard: {
    title: "Стандарт у мансарді",
    text: "Двомісний номер під дахом з двоспальним ліжком, телевізором, вішалкою та власним санвузлом.",
    bookingValue: "Стандарт у мансарді",
    images: [
      "images/standrt/1.jpg",
      "images/standrt/2.jpg"
    ]
  },

  family: {
    title: "Сімейний з балконом",
    text: "Просторий номер для сім'ї з двоспальним і двоярусним ліжками, балконом з виглядом на ліс та власним санвузлом.",
    bookingValue: "Сімейний з балконом",
    images: [
      "images/family/1.jpg",
      "images/family/2.jpg",
      "images/family/3.jpg",
      "images/family/4.jpg",
      "images/family/5.jpg",
      "images/family/6.jpg"
    ]
  },

  quad: {
    title: "Чотиримісний",
    text: "Номер для чотирьох гостей з двоспальним та двома односпальними ліжками. Є варіанти з балконом і в мансарді.",
    bookingValue: "Чотиримісний",
    images: [
      "images/4misnyi/1.jpg",
      "images/4misnyi/2.jpg",
      "images/4misnyi/3.jpg",
      "images/4misnyi/4.jpg",
      "images/4misnyi/5.jpg",
      "images/4misnyi/6.jpg",
      "images/4misnyi/7.jpg",
      "images/4misnyi/8.jpg",
      "images/4misnyi/9.jpg"
    ]
  }
};

let currentRoomGallery = null;
let currentRoomIndex = 0;
let roomGalleryRequest = 0;
const roomFallbackImage = "images/background/beckground.jpg";

const roomModal = document.getElementById("roomModal");
const roomModalClose = document.getElementById("roomModalClose");
const roomModalTitle = document.getElementById("roomModalTitle");
const roomModalText = document.getElementById("roomModalText");
const roomMainImage = document.getElementById("roomMainImage");
const roomThumbs = document.getElementById("roomThumbs");
const roomCounter = document.getElementById("roomCounter");
const roomPrev = document.getElementById("roomPrev");
const roomNext = document.getElementById("roomNext");
const roomModalBook = document.getElementById("roomModalBook");

function getRoomImages() {
  if (
    !currentRoomGallery ||
    !currentRoomGallery.resolvedImages ||
    currentRoomGallery.resolvedImages.length === 0
  ) {
    return [roomFallbackImage];
  }

  return currentRoomGallery.resolvedImages;
}

function loadRoomImage(src) {
  return new Promise(resolve => {
    const img = new Image();

    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function openRoomGallery(galleryName) {
  const selectedGallery = roomGalleries[galleryName];

  currentRoomGallery = selectedGallery;
  currentRoomIndex = 0;
  roomGalleryRequest++;

  if (!currentRoomGallery || !roomModal) return;

  roomModalTitle.textContent = currentRoomGallery.title;
  roomModalText.textContent = currentRoomGallery.text;

  if (roomModalBook) {
    roomModalBook.dataset.room = currentRoomGallery.bookingValue;
  }

  renderRoomGallery();
  roomModal.classList.add("active");
  document.body.style.overflow = "hidden";

  const requestId = roomGalleryRequest;
  const existingImages = (await Promise.all(
    selectedGallery.images.map(loadRoomImage)
  )).filter(Boolean);

  if (requestId !== roomGalleryRequest || currentRoomGallery !== selectedGallery) {
    return;
  }

  selectedGallery.resolvedImages = existingImages;
  currentRoomIndex = 0;
  renderRoomGallery();
}

function renderRoomGallery() {
  if (
    !currentRoomGallery ||
    !roomMainImage ||
    !roomThumbs ||
    !roomCounter
  ) {
    return;
  }

  const images = getRoomImages();
  const currentImage = images[currentRoomIndex];

  roomMainImage.onerror = () => {
    roomMainImage.onerror = null;
    roomMainImage.src = roomFallbackImage;
  };
  roomMainImage.src = currentImage;
  roomMainImage.alt = currentRoomGallery.title;

  roomCounter.textContent = `${currentRoomIndex + 1} / ${images.length}`;
  roomThumbs.innerHTML = "";

  images.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${currentRoomGallery.title} фото ${index + 1}`;
    img.onerror = () => {
      img.onerror = null;
      img.src = roomFallbackImage;
    };

    if (index === currentRoomIndex) {
      img.classList.add("active");
    }

    img.addEventListener("click", event => {
      event.stopPropagation();
      currentRoomIndex = index;
      renderRoomGallery();
    });

    roomThumbs.appendChild(img);
  });
}

function closeRoomGallery() {
  if (!roomModal) return;

  roomGalleryRequest++;
  roomModal.classList.remove("active");
  document.body.style.overflow = "";
}

document.querySelectorAll(".room-gallery-open").forEach(card => {
  card.addEventListener("click", event => {
    if (event.target.closest(".openBooking")) return;

    const galleryName = card.getAttribute("data-room-gallery");
    openRoomGallery(galleryName);
  });
});

if (roomModalClose) {
  roomModalClose.addEventListener("click", closeRoomGallery);
}

if (roomModal) {
  roomModal.addEventListener("click", e => {
    if (e.target === roomModal) {
      closeRoomGallery();
    }
  });
}

if (roomPrev) {
  roomPrev.addEventListener("click", event => {
    event.stopPropagation();
    if (!currentRoomGallery) return;

    const images = getRoomImages();

    currentRoomIndex =
      (currentRoomIndex - 1 + images.length) % images.length;

    renderRoomGallery();
  });
}

if (roomNext) {
  roomNext.addEventListener("click", event => {
    event.stopPropagation();
    if (!currentRoomGallery) return;

    const images = getRoomImages();

    currentRoomIndex = (currentRoomIndex + 1) % images.length;

    renderRoomGallery();
  });
}

document.addEventListener("keydown", e => {
  if (!roomModal || !roomModal.classList.contains("active")) return;

  if (e.key === "Escape") {
    closeRoomGallery();
  }

  if (e.key === "ArrowLeft" && roomPrev) {
    roomPrev.click();
  }

  if (e.key === "ArrowRight" && roomNext) {
    roomNext.click();
  }
});

const serviceGalleries = {
  kitchen: {
    title: "Кухня",
    text: "На кожному поверсі є кухня з усім необхідним для комфортного приготування їжі: плита, мікрохвильова піч, холодильник, посудомийна машина, чайник та посуд.",
    images: [
      "images/kitchen/1.jpg",
      "images/kitchen/2.jpg",
      "images/kitchen/3.jpg",
      "images/kitchen/4.jpg",
      "images/kitchen/5.jpg",
      "images/kitchen/6.jpg",
      "images/kitchen/7.jpg",
      "images/kitchen/8.jpg"
    ]
  },

  sauna: {
    title: "Сауна",
    text: "У комплексі є дві сауни на 6 осіб кожна з кімнатою відпочинку. Чудовий варіант для релаксу після прогулянок Карпатами.",
    images: [
      "images/sauna/1.jpg",
      "images/sauna/2.jpg",
      "images/sauna/3.jpg",
      "images/sauna/4.jpg",
      "images/sauna/5.jpg"
    ]
  },

  conference: {
    title: "Конференц-зал",
    text: "Конференц-зал на 40 місць із проектором, аудіосистемою, телевізором та Wi-Fi. Підходить для тренінгів, зустрічей і групових заїздів.",
    images: [
      "images/conference/1.jpg",
      "images/conference/2.jpg"
    ]
  },

  active: {
    title: "Активний відпочинок",
    text: "Поруч доступні екскурсії, походи в гори, кінні прогулянки, збір грибів та ягід. На території є настільний теніс, волейбол і батут.",
    images: [
      "images/active/1.jpg",
      "images/active/2.jpg",
      "images/active/3.jpg",
      "images/active/4.jpg",
      "images/active/5.jpg"
    ]
  },

  parking: {
    title: "Паркінг і гараж",
    text: "Для гостей доступний безкоштовний паркінг і гаражі під наглядом. Також можна замовити таксі або транспортні послуги за домовленістю.",
    images: [
      "images/parking/1.jpg",
      "images/parking/2.jpg",
      "images/parking/3.jpg",
      "images/parking/4.jpg"
    ]
  }
};

let currentServiceGallery = null;
let currentServiceIndex = 0;

const serviceModal = document.getElementById("serviceModal");
const serviceModalClose = document.getElementById("serviceModalClose");
const serviceModalTitle = document.getElementById("serviceModalTitle");
const serviceModalText = document.getElementById("serviceModalText");
const serviceMainImage = document.getElementById("serviceMainImage");
const serviceThumbs = document.getElementById("serviceThumbs");
const serviceCounter = document.getElementById("serviceCounter");
const servicePrev = document.getElementById("servicePrev");
const serviceNext = document.getElementById("serviceNext");

function openServiceGallery(galleryName) {
  currentServiceGallery = serviceGalleries[galleryName];
  currentServiceIndex = 0;

  if (!currentServiceGallery || !serviceModal) return;

  serviceModalTitle.textContent = currentServiceGallery.title;
  serviceModalText.textContent = currentServiceGallery.text;

  renderServiceGallery();
  serviceModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function renderServiceGallery() {
  if (
    !currentServiceGallery ||
    !serviceMainImage ||
    !serviceThumbs ||
    !serviceCounter
  ) {
    return;
  }

  const images = currentServiceGallery.images;
  const currentImage = images[currentServiceIndex];

  serviceMainImage.src = currentImage;
  serviceMainImage.alt = currentServiceGallery.title;

  serviceCounter.textContent = `${currentServiceIndex + 1} / ${images.length}`;
  serviceThumbs.innerHTML = "";

  images.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${currentServiceGallery.title} фото ${index + 1}`;

    if (index === currentServiceIndex) {
      img.classList.add("active");
    }

    img.addEventListener("click", () => {
      currentServiceIndex = index;
      renderServiceGallery();
    });

    serviceThumbs.appendChild(img);
  });
}

function closeServiceGallery() {
  if (!serviceModal) return;

  serviceModal.classList.remove("active");
  document.body.style.overflow = "";
}

document.querySelectorAll(".service-gallery-open").forEach(card => {
  card.addEventListener("click", () => {
    const galleryName = card.getAttribute("data-gallery");
    openServiceGallery(galleryName);
  });
});

if (serviceModalClose) {
  serviceModalClose.addEventListener("click", closeServiceGallery);
}

if (serviceModal) {
  serviceModal.addEventListener("click", e => {
    if (e.target === serviceModal) {
      closeServiceGallery();
    }
  });
}

if (servicePrev) {
  servicePrev.addEventListener("click", () => {
    if (!currentServiceGallery) return;

    currentServiceIndex =
      (currentServiceIndex - 1 + currentServiceGallery.images.length) %
      currentServiceGallery.images.length;

    renderServiceGallery();
  });
}

if (serviceNext) {
  serviceNext.addEventListener("click", () => {
    if (!currentServiceGallery) return;

    currentServiceIndex =
      (currentServiceIndex + 1) % currentServiceGallery.images.length;

    renderServiceGallery();
  });
}

document.addEventListener("keydown", e => {
  if (!serviceModal || !serviceModal.classList.contains("active")) return;

  if (e.key === "Escape") {
    closeServiceGallery();
  }

  if (e.key === "ArrowLeft" && servicePrev) {
    servicePrev.click();
  }

  if (e.key === "ArrowRight" && serviceNext) {
    serviceNext.click();
  }
});
