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

    showSlide(current);
}


// Відправка заявки в Telegram
let lastSendTime = 0;

function sendTelegram() {
    const now = Date.now();

    if (now - lastSendTime < 30000) {
        alert("Зачекайте 30 секунд перед повторною відправкою.");
        return;
    }

    const token = "token";
    const chatId = "chatId";

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;
    const room = document.getElementById("room").value;
    const guests = document.getElementById("guests").value.trim();

    if (!name || !phone || !dateFrom || !dateTo || !room || !guests) {
        alert("Будь ласка, заповніть усі поля.");
        return;
    }

    lastSendTime = now;

    const text =
`🏔 Нова заявка з сайту Крокус

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

            document.getElementById("name").value = "";
            document.getElementById("phone").value = "";
            document.getElementById("dateFrom").value = "";
            document.getElementById("dateTo").value = "";
            document.getElementById("room").value = "";
            document.getElementById("guests").value = "";
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
