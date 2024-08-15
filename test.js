'use strict';

class Test {
    constructor() {
        this.testResults = document.getElementsByClassName('test-results');
        console.log(this.testResults);
    }

    async run() {
        console.log(new Date().toISOString(), '[Test]', 'Running the test');

        const apiKey = '5c4df89fc5dc3ec36950c8383e57350d'; // OpenWeatherMap API key
        const latitude = 36.0331; // Latitude for Brentwood, TN
        const longitude = -86.7828; // Longitude for Brentwood, TN

        try {
            // Making an API call using axios
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    appid: apiKey,
                    units: 'imperial' // Convert temperature to Fahrenheit
                }
            });

            // If the call is successful, display the results
            this.setResults(response.data);
        } catch (error) {
            // If there's an error, display it
            this.setError(error.message);
        }
    }

    setError(message) {
        const errorContainer = this.testResults[0];

        // Clear any existing content
        errorContainer.innerHTML = '';

        // Create an error message container
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger'; // Bootstrap class for styling (if Bootstrap is used)
        errorMessage.style.padding = '10px';
        errorMessage.style.borderRadius = '5px';
        errorMessage.style.marginTop = '10px';

        // Create a strong element for the title
        const strongMessage = document.createElement('strong');
        strongMessage.innerText = 'Error: ';
        
        // Create a span for the detailed error message
        const detailedMessage = document.createElement('span');
        detailedMessage.innerText = message || 'An unexpected error occurred. Please try again later.';

        // Append strong and span elements to the error message container
        errorMessage.appendChild(strongMessage);
        errorMessage.appendChild(detailedMessage);

        // Append the error message container to the test results area
        errorContainer.appendChild(errorMessage);

        // Optionally, log the error to the console for debugging
        console.error(`[Test Error]: ${message}`);
    }

    setResults(results) {
        console.log(results);
        const { name, main, weather, wind, sys } = results;
        let locationIcon = document.querySelector('.weather-icon');
        const { icon } = weather[0];
        locationIcon.innerHTML = `<img src="http://openweathermap.org/img/w/${icon}.png">`;
        const currentDate = new Date()
        document.getElementsByClassName('location')[0].innerHTML = name;
        document.getElementsByClassName('temperature')[0].innerHTML = `${Math.round(main.temp)} °F`;
        document.getElementsByClassName('condition')[0].innerHTML = weather[0].description;
        document.getElementsByClassName('wind-speed')[0].innerHTML = `Wind : ${wind.speed} mph`;
        document.getElementsByClassName('humidity')[0].innerHTML = `Humidity : ${main.humidity} %`;
        document.getElementsByClassName('sunrise')[0].innerHTML = `Sunrise : ${this.convertUnixTimestampToTime(sys.sunrise)}`;
        document.getElementsByClassName('sunset')[0].innerHTML = `Sunset : ${this.convertUnixTimestampToTime(sys.sunset)}`;
        document.getElementsByClassName('min-max-temp')[0].innerHTML = `H: ${main.temp_min} °F &nbsp | &nbsp  L: ${main.temp_max} °F`;
        document.getElementsByClassName('time')[0].innerHTML = currentDate.getHours() + ":" + currentDate.getMinutes();
        this.renderMap();
        this.getNews();
        document.getElementById('main').style.visibility = 'visible'
    }

    renderMap() {
        const map = L.map('map').setView([36.1627, -86.7816], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const apiKey = '5c4df89fc5dc3ec36950c8383e57350d';
        L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
            attribution: '&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
            maxZoom: 18
        }).addTo(map);

        L.marker([36.1627, -86.7816]).addTo(map)
            .bindPopup('Nashville, TN')
            .openPopup();
    }

    async getNews() {
        const country = 'us';
        const category = 'business';
        const apiKey = '6c351d71881d42d89629b213e95f38d1'; // NewsAPI key

        try {
            // Making an API call using axios
            const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
                params: {
                    country: country,
                    category: category,
                    apiKey: apiKey
                }
            });

            console.log(response.data.articles);
            const newsArray = response.data.articles;
            const carouselIndicators = document.getElementById('carouselIndicators');
            const carouselInner = document.getElementById('carouselInner');

            newsArray.forEach((newsItem, index) => {
                // Create carousel indicator
                const indicator = document.createElement('button');
                indicator.type = 'button';
                indicator.dataset.bsTarget = '#carouselExampleCaptions';
                indicator.dataset.bsSlideTo = index;
                indicator.className = index === 0 ? 'active' : '';
                indicator.setAttribute('aria-current', index === 0 ? 'true' : '');
                indicator.setAttribute('aria-label', `Slide ${index + 1}`);
                carouselIndicators.appendChild(indicator);

                // Create carousel item
                const carouselItem = document.createElement('div');
                carouselItem.style.height = '300px';
                carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;

                // Create card content
                const cardContent = `
                    <div class="carousel-caption d-none d-md-block">
                        <a href="${newsItem.url}" class="h1 text-dark headline">${newsItem.title}</a>
                        <p class="text-dark pt-3">${newsItem.source.name} | ${new Date(newsItem.publishedAt).toDateString()}</p>
                    </div>
                `;

                carouselItem.innerHTML = cardContent;
                carouselInner.appendChild(carouselItem);
            });

        } catch (error) {
            // If there's an error, display it
            this.setError(error.message);
        }
    }

    convertUnixTimestampToTime(unixTimestamp) {
        const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
        const hours = date.getHours();
        const minutes = "0" + date.getMinutes();
        // Will display time in 10:30 format
        return hours + ':' + minutes.substr(-2);
    }
}

function addButtonForTest(context, test) {
    let testButton = document.createElement('button');

    testButton.type = 'button';
    testButton.innerText = 'Get the Nashville Weather';
    testButton.onclick = () => test.run();

    context.appendChild(testButton);

    return testButton;
}

// Create the Test and add a button to the UI for running the test
const test = new Test();
const buttonContainer = document.getElementsByClassName('button-container')[0];

addButtonForTest(buttonContainer, test);