const apiKey = "ed06d15869480d8c2776e83f0652a54b";
const input = document.getElementById("cityInput");
const suggestionsList = document.getElementById("suggestions");
const weatherContainer = document.getElementById("weatherContainer");
const forecastContainer = document.getElementById("forecastContainer");
const appBackground = document.body;

// Auto-suggestions using Geo API
input.addEventListener("input", async () => {
  const query = input.value.trim();
  if (!query) {
    suggestionsList.innerHTML = "";
    return;
  }

  const res = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
  );
  const data = await res.json();
  suggestionsList.innerHTML = "";
  data.forEach((place) => {
    const li = document.createElement("li");
    li.textContent = `${place.name}, ${place.country}`;
    li.addEventListener("click", () => {
      input.value = place.name;
      suggestionsList.innerHTML = "";
      getWeather(place.name);
    });
    suggestionsList.appendChild(li);
  });
});

//  Enter key support for search
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = input.value.trim();
    if (city !== "") {
      suggestionsList.innerHTML = "";
      getWeather(city);
    }
  }
});

async function getWeather(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    const data = await res.json();
    if (data.cod !== 200) {
      weatherContainer.innerHTML = `<p class="error">City not found</p>`;
      return;
    }

    const {
      name,
      sys: { country, sunrise, sunset },
      main: { temp, humidity },
      wind: { speed },
      weather,
    } = data;

    const localTime = new Date(data.dt * 1000).toLocaleTimeString();
    const icon = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    weatherContainer.innerHTML = `
      <div class="weather-header">
        <div class="location-info">
          <h2>${name}, ${country}</h2>
          <p>Local Time: ${localTime}</p>
        </div>
        <div class="weather-icon-wrapper">
          <img src="${icon}" alt="${weather[0].main}" class="weather-icon" />
        </div>
      </div>
      <div class="weather-details">
        <div class="details-column">
          <p><strong>Temperature:</strong> ${temp}°C</p>
          <p><strong>Humidity:</strong> ${humidity}%</p>
        </div>
        <div class="details-column">
          <p><strong>Wind Speed:</strong> ${speed} m/s</p>
          <p><strong>Sunrise:</strong> ${new Date(
            sunrise * 1000
          ).toLocaleTimeString()}</p>
          <p><strong>Sunset:</strong> ${new Date(
            sunset * 1000
          ).toLocaleTimeString()}</p>
        </div>
      </div>
    `;

    updateBackground(weather[0].main);
    getForecast(city);
  } catch (err) {
    weatherContainer.innerHTML = `<p class="error">Something went wrong.</p>`;
  }
}

async function getForecast(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
  );
  const data = await res.json();
  const daily = {};

  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date]) {
      daily[date] = item;
    }
  });

  const days = Object.keys(daily).slice(0, 5);
  forecastContainer.innerHTML = days
    .map((day) => {
      const { weather, main } = daily[day];
      const icon = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
      return `
        <div class="forecast-card">
          <h4>${new Date(day).toLocaleDateString()}</h4>
          <img src="${icon}" alt="${weather[0].main}" />
          <p>${weather[0].main}</p>
          <p>${main.temp}°C</p>
        </div>
      `;
    })
    .join("");
}

// Dynamic background based on weather
function updateBackground(condition) {
  let bg;
  switch (condition.toLowerCase()) {
    case "clear":
      bg = "linear-gradient(to right, #fceabb, #f8b500)";
      break;
    case "clouds":
      bg = "linear-gradient(to right, #d7d2cc, #304352)";
      break;
    case "rain":
    case "drizzle":
      bg = "linear-gradient(to right, #4e54c8, #8f94fb)";
      break;
    case "thunderstorm":
      bg = "linear-gradient(to right, #373b44, #4286f4)";
      break;
    case "snow":
      bg = "linear-gradient(to right, #e0eafc, #cfdef3)";
      break;
    default:
      bg = "#92dce5";
  }
  appBackground.style.background = bg;
}
