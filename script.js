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

// Відправка заявки в Telegram + Google Таблицю
function sendTelegramModal() {
  const name = document.getElementById("modalName").value.trim();
  const phone = document.getElementById("modalPhone").value.trim();
  const dateFrom = document.getElementById("modalDateFrom").value;
  const dateTo = document.getElementById("modalDateTo").value;
  const room = document.getElementById("modalRoom").value;
  const guests = document.getElementById("guestCount").textContent;

  if (!name || !phone || !dateFrom || !dateTo || !room || !guests) {
    alert("Будь ласка, заповніть усі поля.");
    return;
  }

  sendBookingToGoogle({
    name,
    phone,
    dateFrom,
    dateTo,
    room,
    guests,
    source: "pop-up"
  });

  alert("Заявку успішно надіслано!");

  document.getElementById("bookingModal").classList.remove("active");
  document.getElementById("modalName").value = "";
  document.getElementById("modalPhone").value = "";
  document.getElementById("modalDateFrom").value = "";
  document.getElementById("modalDateTo").value = "";
  document.getElementById("modalRoom").value = "";
  document.getElementById("guestCount").textContent = "1";
}

 

// Анімація і pop-up бронювання
const bookingModal = document.getElementById("bookingModal");
const closeBooking = document.getElementById("closeBooking");
const openBookingButtons = document.querySelectorAll(".openBooking");

openBookingButtons.forEach(button => {
  button.addEventListener("click", () => {
    bookingModal.classList.add("active");

    startCalendar();

    const room = button.dataset.room;
    if (room) {
      document.getElementById("modalRoom").value = room;
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
const serviceGalleries = {
  kitchen: {
    title: "Кухня",
    text: "На кожному поверсі є кухня з усім необхідним для комфортного приготування їжі: плита, мікрохвильова піч, холодильник, посудомийна машина, чайник та посуд.",
    images: [
      "images/kitchen/1.webp",
      "images/kitchen/2.webp",
      "images/kitchen/3.webp",
      "images/kitchen/4.webp",
      "images/kitchen/5.webp",
      "images/kitchen/6.webp",
      "images/kitchen/7.webp",
      "images/kitchen/8.webp"
    ]
  },

  sauna: {
    title: "Сауна",
    text: "У комплексі є дві сауни на 6 осіб кожна з кімнатою відпочинку. Чудовий варіант для релаксу після прогулянок Карпатами.",
    images: [
      "images/sauna/1.webp",
      "images/sauna/2.webp",
      "images/sauna/3.webp",
      "images/sauna/4.webp",
      "images/sauna/5.webp",
      "images/sauna/6.webp",
      "images/sauna/7.webp",
      "images/sauna/8.webp"
    ]
  },

  conference: {
    title: "Конференц-зал",
    text: "Конференц-зал на 40 місць із проектором, аудіосистемою, телевізором та Wi-Fi. Підходить для тренінгів, зустрічей і групових заїздів.",
    images: [
      "images/conference/1.webp",
      "images/conference/2.webp",
      "images/conference/3.webp",
      "images/conference/4.webp",
      "images/conference/5.webp",
      "images/conference/6.webp",
      "images/conference/7.webp",
      "images/conference/8.webp"
    ]
  },

  active: {
    title: "Активний відпочинок",
    text: "Поруч доступні екскурсії, походи в гори, кінні прогулянки, збір грибів та ягід. На території є настільний теніс, волейбол і батут.",
    images: [
      "images/active/1.webp",
      "images/active/2.webp",
      "images/active/3.webp",
      "images/active/4.webp",
      "images/active/5.webp",
      "images/active/6.webp",
      "images/active/7.webp",
      "images/active/8.webp"
    ]
  },

  parking: {
    title: "Паркінг і гараж",
    text: "Для гостей доступний безкоштовний паркінг і гаражі під наглядом. Також можна замовити таксі або транспортні послуги за домовленістю.",
    images: [
      "images/parking/1.webp",
      "images/parking/2.webp",
      "images/parking/3.webp",
      "images/parking/4.webp",
      "images/parking/5.webp",
      "images/parking/6.webp",
      "images/parking/7.webp",
      "images/parking/8.webp"
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
  if (!currentServiceGallery) return;

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
    openServiceGallery(card.dataset.gallery);
  });
});

if (serviceModalClose) {
  serviceModalClose.addEventListener("click", closeServiceGallery);
}

if (serviceModal) {
  serviceModal.addEventListener("click", (e) => {
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

document.addEventListener("keydown", (e) => {
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