const backendURL = 'https://poj.onrender.com';




document.addEventListener('DOMContentLoaded', () => {
    fetchAndLogSpotifyGenres();

    document.getElementById('submit-btn').addEventListener('click', async () => {
    const city = document.getElementById('location').value;
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    try {
        const weatherResponse = await fetch(`${backendURL}/api/weather?city=${city}`);
        const weatherData = await weatherResponse.json();

        const mainWeather = weatherData.weather[0].main.toLowerCase();
        const temperature = (weatherData.main.temp - 273.15).toFixed(2); // Kelvin to Celsius

        const genre = mapWeatherToGenre(mainWeather);

        const tokenResponse = await fetch(`${backendURL}/api/token`);
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        const musicResponse = await fetch(`https://api.spotify.com/v1/recommendations?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=${genre}&limit=4`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const musicData = await musicResponse.json();

        setDom({
            city: city,
            weather: mainWeather,
            temperature: temperature,
            description: getWeatherDescription(mainWeather),
            emoji: getWeatherEmoji(mainWeather),
            tracks: musicData.tracks
        });

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch weather or music data.');
    }
});
});


let validGenres = [];
async function fetchValidGenres() {
    try {
        const response = await fetch(`${backendURL}/api/genres`);
        const data = await response.json();
        validGenres = data.genres;
        console.log('✅ Valid Spotify genres loaded:', validGenres);
    } catch (err) {
        console.error('Failed to load genres:', err);
    }
}


function mapWeatherToGenre(weather) {
    const genres = {
        clear: ['pop', 'indie', 'summer', 'happy'],
        clouds: ['chill', 'ambient', 'indie-pop'],
        rain: ['jazz', 'blues', 'rainy-day', 'soul'],
        snow: ['classical', 'piano', 'holidays'],
        thunderstorm: ['metal', 'hard-rock', 'industrial'],
        drizzle: ['acoustic', 'folk', 'romantic'],
        mist: ['trip-hop', 'ambient', 'new-age'],
        haze: ['electronic', 'minimal-techno', 'trip-hop']
    };

    const validGenres = genres[weather] || ['pop'];
    return validGenres[Math.floor(Math.random() * validGenres.length)];
}

function getWeatherDescription(weather) {
    const desc = {
        clear: "Sunny skies and bright sunshine.",
        clouds: "Overcast and cloudy.",
        rain: "Rain showers falling down.",
        snow: "Cold and snowy.",
        thunderstorm: "Thunder and lightning fill the sky.",
        drizzle: "Light rain and mist.",
        mist: "Foggy and mystical.",
        haze: "Dusty or smoky air."
    };
    return desc[weather] || "Weather condition unknown.";
}

function getWeatherEmoji(weather) {
    const emojis = {
        clear: "☀️",
        clouds: "☁️",
        rain: "🌧️",
        snow: "❄️",
        thunderstorm: "⛈️",
        drizzle: "🌦️",
        mist: "🌫️",
        haze: "🌁"
    };
    return emojis[weather] || "❔";
}

function setDom(data) {
    document.getElementById('weather-info').innerHTML = `
        <h2>${data.city}</h2>
        <p>${data.emoji} ${data.description}</p>
        <p>Temperature: ${data.temperature}°C</p>
    `;

    const musicDiv = document.getElementById('music-info');
    musicDiv.innerHTML = '';
    data.tracks.forEach(track => {
        const div = document.createElement('div');
        div.innerHTML = `
            <img src="${track.album.images[0].url}" width="100"><br>
            <strong>${track.name}</strong><br>
            <em>${track.artists[0].name}</em><br>
            <a href="${track.external_urls.spotify}" target="_blank">Play on Spotify</a>
            <hr>
        `;
        musicDiv.appendChild(div);
    });
}
