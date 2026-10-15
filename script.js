const burger = document.getElementById("burger");
const nav = document.getElementById("nav");

burger?.addEventListener("click", () => {
  nav?.classList.toggle("open");
});

document.querySelectorAll("#nav a").forEach((a) => {
  a.addEventListener("click", () => nav?.classList.remove("open"));
});

const form = document.getElementById("form");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const note = document.getElementById("note");
  const submitButton = form.querySelector('[type="submit"]');
  const data = new FormData(form);

  const request = {
    name: String(data.get("name") || "").trim(),
    contact: String(data.get("contact") || "").trim(),
    service: String(data.get("service") || "").trim(),
    message: String(data.get("message") || "").trim()
  };

  if (!request.name || !request.contact || !request.service) {
    if (note) note.textContent = "Заповни ім’я, контакт і послугу.";
    return;
  }

  if (note) note.textContent = "Надсилаємо заявку…";
  if (submitButton) submitButton.disabled = true;

  try {
    const response = await fetch(
      "https://nova-web-site.netlify.app/.netlify/functions/send-telegram",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Не вдалося надіслати заявку.");
    }

    if (note) note.textContent = "Дякуємо! Заявку надіслано. Скоро зв’яжемося з тобою.";
    form.reset();
  } catch (error) {
    if (note) {
      note.textContent =
        error.message || "Помилка надсилання. Спробуй ще раз пізніше.";
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});
