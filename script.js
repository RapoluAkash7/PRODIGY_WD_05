const API_KEY = "de765633d3d636c0b03e69febb099346";

const weatherCard = document.getElementById("weatherCard");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");
const forecastContainer = document.getElementById("forecastContainer");
const forecastCards = document.getElementById("forecastCards");

/* Live Date & Time */

function updateDateTime() {
    const now = new Date();

    document.getElementById("dateTime").innerHTML =
        now.toLocaleString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
}

setInterval(updateDateTime, 1000);
updateDateTime();

/* Search Weather */

async function getWeather(cityName) {

    const city =
        cityName || document.getElementById("cityInput").value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    showLoader();

    try {

        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const currentData = await currentResponse.json();

        if (currentData.cod !== 200) {
            throw new Error("City not found");
        }

        displayCurrentWeather(currentData);

        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );

        const forecastData = await forecastResponse.json();

        displayForecast(forecastData);

        hideLoader();

    } catch (error) {

        hideLoader();
        showError("City not found. Try another location.");
    }
}

/* Current Location Weather */

function getLocationWeather() {

    if (!navigator.geolocation) {
        showError("Geolocation not supported.");
        return;
    }

    showLoader();

    navigator.geolocation.getCurrentPosition(
        async (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {

                const currentResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );

                const currentData = await currentResponse.json();

                displayCurrentWeather(currentData);

                const forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );

                const forecastData = await forecastResponse.json();

                displayForecast(forecastData);

                hideLoader();

            } catch (error) {

                hideLoader();
                showError("Unable to fetch weather data.");
            }

        },
        () => {
            hideLoader();
            showError("Location permission denied.");
        }
    );
}

/* Display Current Weather */

function displayCurrentWeather(data) {

    errorBox.innerHTML = "";

    weatherCard.style.display = "block";

    document.getElementById("city").innerHTML =
        `${data.name}, ${data.sys.country}`;

    document.getElementById("temperature").innerHTML =
        `${Math.round(data.main.temp)}°C`;

    document.getElementById("condition").innerHTML =
        data.weather[0].description;

    document.getElementById("feelsLike").innerHTML =
        `${Math.round(data.main.feels_like)}°C`;

    document.getElementById("humidity").innerHTML =
        `${data.main.humidity}%`;

    document.getElementById("wind").innerHTML =
        `${data.wind.speed} m/s`;

    document.getElementById("pressure").innerHTML =
        `${data.main.pressure} hPa`;

    document.getElementById("visibility").innerHTML =
        `${(data.visibility / 1000).toFixed(1)} km`;

    document.getElementById("clouds").innerHTML =
        `${data.clouds.all}%`;

    const sunrise = new Date(data.sys.sunrise * 1000);

    const sunset = new Date(data.sys.sunset * 1000);

    document.getElementById("sunrise").innerHTML =
        sunrise.toLocaleTimeString();

    document.getElementById("sunset").innerHTML =
        sunset.toLocaleTimeString();

    const iconCode = data.weather[0].icon;

    document.getElementById("weatherIcon").src =
        `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    changeBackground(data.weather[0].main);
}

/* Forecast */

function displayForecast(data) {

    forecastCards.innerHTML = "";

    forecastContainer.style.display = "block";

    const dailyForecasts = data.list.filter(
        item => item.dt_txt.includes("12:00:00")
    );

    dailyForecasts.slice(0, 5).forEach(day => {

        const date = new Date(day.dt_txt);

        const card = document.createElement("div");

        card.classList.add("forecast-card");

        card.innerHTML = `
            <h4>${date.toLocaleDateString("en-US", {
                weekday: "short"
            })}</h4>

            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">

            <p>${Math.round(day.main.temp)}°C</p>

            <p>${day.weather[0].main}</p>
        `;

        forecastCards.appendChild(card);
    });
}

/* Dynamic Background */

function changeBackground(weather) {

    const bg = document.querySelector(".animated-bg");

    switch (weather) {

        case "Clear":
            bg.style.background =
                "linear-gradient(-45deg,#ff9a00,#ffcf33,#ff9a00,#ffcf33)";
            break;

        case "Clouds":
            bg.style.background =
                "linear-gradient(-45deg,#6b7280,#9ca3af,#6b7280,#9ca3af)";
            break;

        case "Rain":
            bg.style.background =
                "linear-gradient(-45deg,#0f2027,#203a43,#2c5364,#0f2027)";
            break;

        case "Thunderstorm":
            bg.style.background =
                "linear-gradient(-45deg,#232526,#414345,#232526,#414345)";
            break;

        case "Snow":
            bg.style.background =
                "linear-gradient(-45deg,#d3cce3,#e9e4f0,#d3cce3,#e9e4f0)";
            break;

        default:
            bg.style.background =
                "linear-gradient(-45deg,#0f172a,#1e3a8a,#2563eb,#7c3aed)";
    }

    bg.style.backgroundSize = "400% 400%";
}

/* Loader */

function showLoader() {
    loader.style.display = "block";
    weatherCard.style.display = "none";
    forecastContainer.style.display = "none";
    errorBox.innerHTML = "";
}

function hideLoader() {
    loader.style.display = "block";
    setTimeout(() => {
        loader.style.display = "none";
    }, 500);
}

/* Error */

function showError(message) {
    errorBox.innerHTML = message;
}

/* Enter Key Search */

document
    .getElementById("cityInput")
    .addEventListener("keypress", function (e) {

        if (e.key === "Enter") {
            getWeather();
        }
    });

/* Load Current Location On Startup */

window.onload = () => {
    getLocationWeather();
};