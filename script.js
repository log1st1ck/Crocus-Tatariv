// Слайдер для фото номера
const slides = document.querySelectorAll('.slide');
const next = document.querySelector('.next');
const prev = document.querySelector('.prev');

let current = 0;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));

    if (slides.length > 0) {
        slides[index].classList.add('active');
    }
}

if (next && prev && slides.length > 0) {
    next.addEventListener('click', () => {
        current = (current + 1) % slides.length;
        showSlide(current);
    });

    prev.addEventListener('click', () => {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
    });

    showSlide(current);;
}


// Відправка заявки в Telegram
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

    const token = "your_token_from_bot_Father";
    const chatId = "your_chatid";

    const text =
`🏔 Нова заявка з pop-up Крокус

👤 Ім'я: ${name}
📞 Телефон: ${phone}
📅 Заїзд: ${dateFrom}
📅 Виїзд: ${dateTo}
🏠 Номер: ${room}
👥 Гостей: ${guests}`;

    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            alert("Заявку успішно надіслано!");
            document.getElementById("bookingModal").classList.remove("active");

            document.getElementById("modalName").value = "";
            document.getElementById("modalPhone").value = "";
            document.getElementById("modalDateFrom").value = "";
            document.getElementById("modalDateTo").value = "";
            document.getElementById("modalRoom").value = "";
            document.getElementById("guestCount").textContent = "1";
        } else {
            alert("Помилка відправки.");
            console.log(data);
        }
    })
    .catch(error => {
        alert("Помилка з'єднання.");
        console.log(error);
    });
}
// Анімація і pop-up бронювання
const bookingModal = document.getElementById("bookingModal");
const closeBooking = document.getElementById("closeBooking");
const openBookingButtons = document.querySelectorAll(".openBooking");

openBookingButtons.forEach(button => {
    button.addEventListener("click", () => {
        bookingModal.classList.add("active");

        // Запускаємо календар один раз
        startCalendar();

        // Якщо кнопка має data-room, автоматично вибираємо номер
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
    bookingModal.addEventListener("click", (e) => {
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
