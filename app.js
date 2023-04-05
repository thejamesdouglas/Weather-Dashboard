const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const searchHistory = document.getElementById('search-history');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const cityName = cityInput.value.trim();
    if (cityName) {
        getWeather(cityName);
    }
});

function getWeather(cityName) {
    const apiKey = 'f9eb7079ff683e087e86d13e52641a67';
    const coordUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

    fetch(coordUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching coordinates: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const { lat, lon } = data.coord;
            const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

            fetch(weatherUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error fetching weather data: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    displayCurrentWeather(data);
                    displayForecast(data);
                    addToSearchHistory(cityName);
                });
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

function displayCurrentWeather(data) {
    const today = new Date().toLocaleDateString();
    const currentWeatherData = data.list.find(item => {
        const itemDate = new Date(item.dt * 1000).toLocaleDateString();
        return itemDate === today;
    });

    const { dt, main, weather, wind } = currentWeatherData;
    const { name } = data.city;
    const date = new Date(dt * 1000).toLocaleDateString();
    const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    const html = `
        <div class="current-weather-info">
            <h2>${name} (${date}) <img src="${iconUrl}" alt="${weather[0].description}" /></h2>
            <p>Temperature: ${main.temp} °F</p>
            <p>Wind Speed: ${wind.speed} mph</p>
            <p>Humidity: ${main.humidity} %</p>
        </div>
`;

currentWeather.innerHTML = html;

}

function displayForecast(data) {
    const today = new Date().toLocaleDateString();
    const filteredData = data.list.filter(item => {
        const itemDate = new Date(item.dt * 1000).toLocaleDateString();
        return itemDate !== today;
    });

    const groupedData = filteredData.reduce((acc, item) => {
        const itemDate = new Date(item.dt * 1000).toLocaleDateString();
        if (!acc[itemDate]) {
            acc[itemDate] = [];
        }
        acc[itemDate].push(item);
        return acc;
    }, {});

    const dailyData = Object.values(groupedData).map(items => items[0]);

    const html = dailyData.slice(0, 5).map(item => {
        const { dt, main, weather, wind } = item;
        const date = new Date(dt * 1000).toLocaleDateString();
        const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}.png`;

        return `
            <div class="forecast-item">
                <h3>${date}</h3>
                <img src="${iconUrl}" alt="${weather[0].description}" />
                <p>Temp: ${main.temp} °F</p>
                <p>Wind: ${wind.speed} mph</p>
                <p>Humidity: ${main.humidity} %</p>
            </div>
        `;
    }).join('');

    forecast.innerHTML = `<h2>5-Day Forecast:</h2>${html}`;
}

function addToSearchHistory(cityName) {
    const searchItems = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searchItems.includes(cityName)) {
        searchItems.push(cityName);
        localStorage.setItem('searchHistory', JSON.stringify(searchItems));
    }
    displaySearchHistory();
}

function displaySearchHistory() {
    const searchItems = JSON.parse(localStorage.getItem('searchHistory')) || [];

    const html = searchItems.map(cityName => {
        return `<button class="history-item">${cityName}</button>`;
    }).join('');

    searchHistory.innerHTML = html;
}

searchHistory.addEventListener('click', (e) => {
    if (e.target.matches('.history-item')) {
        getWeather(e.target.textContent);
    }
});

displaySearchHistory();
