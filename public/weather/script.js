 const form = document.getElementById("cityForm");
  const input = document.getElementById("inpCity");
  const msg   = document.querySelector(".msg");
  const list  = document.querySelector(".cities");

  const apiKey = "7f9ab81f734d2ae5158db83ac93fe9b2";

  // Динамічний фон залежно від погоди
  const weatherToBg = {
    "clear":           "180, 220, 255",
    "clouds":          "140, 170, 200",
    "rain":            "100, 120, 160",
    "drizzle":         "120, 150, 180",
    "thunderstorm":    "80, 90, 140",
    "snow":            "220, 230, 240",
    "mist":            "160, 170, 190",
    "fog":             "140, 150, 170",
    default:           "120, 180, 220"
  };

  function setBackground(mainWeather) {
    const key = mainWeather?.toLowerCase() || "default";
    const color = weatherToBg[key] || weatherToBg.default;
    document.body.style.setProperty("--bg-base", color);
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    let cityName = input.value.trim();
    if (!cityName) return;

    msg.textContent = "";

    if (Array.from(list.querySelectorAll(".city-name span"))
        .some(span => span.textContent.toLowerCase() === cityName.toLowerCase())) {
      msg.textContent = "Це місто вже є у списку";
      input.focus();
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric&lang=uk`;

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? "Місто не знайдено" : "Помилка");
        return r.json();
      })
      .then(data => {
        const { main, name, sys, weather } = data;
        const w = weather[0];
        const iconUrl = `https://openweathermap.org/img/wn/${w.icon}@4x.png`;

        setBackground(w.main);

        const li = document.createElement("li");
        li.classList.add("city");

        li.innerHTML = `
          <h2 class="city-name" data-name="${name},${sys.country}">
            <span>${name}</span>
            <sup>${sys.country}</sup>
          </h2>
          <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
          <figure>
            <img class="city-icon" src="${iconUrl}" alt="${w.description}">
            <figcaption>${w.description}</figcaption>
          </figure>
        `;

        list.prepend(li);
        form.reset();
        input.focus();
      })
      .catch(err => {
        msg.textContent = err.message.includes("Місто не знайдено")
          ? "Місто не знайдено 😔"
          : "Щось пішло не так...";
      });
  });