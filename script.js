// API variables
var apiKey = "2181289bd7084fd79c31f4f3743f4732";
var savedSearches = [];

// searched cities
var searchHistoryList = function(cityName) {
    $('.past-search:contains("' + cityName + '")').remove();

    // city name
    var searchHistoryEntry = $("<p>");
    searchHistoryEntry.addClass("past-search");
    searchHistoryEntry.text(cityName);

    
    var searchEntryContainer = $("<div>");
    searchEntryContainer.addClass("past-search-container");
    
    searchEntryContainer.append(searchHistoryEntry);
    
    var searchHistoryContainerEl = $("#search-history-container");
    searchHistoryContainerEl.append(searchEntryContainer);

    if (savedSearches.length > 0){
        // update savedSearches 
        var previousSavedSearches = localStorage.getItem("savedSearches");
        savedSearches = JSON.parse(previousSavedSearches);
    }

    savedSearches.push(cityName);
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

    // reset search input
    $("#search-input").val("");

};

// saved searches
var loadSearchHistory = function() {
    
    var savedSearchHistory = localStorage.getItem("savedSearches");

    if (!savedSearchHistory) {
        return false;
    }
    
    savedSearchHistory = JSON.parse(savedSearchHistory);

    for (var i = 0; i < savedSearchHistory.length; i++) {
        searchHistoryList(savedSearchHistory[i]);
    }
};

var currentWeatherSection = function(cityName) {
    // get and use data from open weather current weather api end point
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
       
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
           
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=${apiKey}`)
                
                .then(function(response) {
                    return response.json();
                })
              
                .then(function(response){
                    searchHistoryList(cityName);

                    // current weather
                    var currentWeatherContainer = $("#current-weather");
                    currentWeatherContainer.addClass("current-weather");

                    
                    var currentTitle = $("#current-title");
                    var currentDay = moment().format("M/D/YYYY");
                    currentTitle.text(`${cityName} (${currentDay})`);
                    var currentIcon = $("#current-weather-picture");
                    currentIcon.addClass("current-weather-picture");
                    var currentIconCode = response.current.weather[0].icon;
                    currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);

                    // current temp
                    var currentTemperature = $("#current-temperature");
                    currentTemperature.text("Temperature: " + response.current.temp + " \u00B0F");

                    // current humidity
                    var currentHumidity = $("#current-humidity");
                    currentHumidity.text("Humidity: " + response.current.humidity + "%");

                    // current wind
                    var currentWindSpeed = $("#current-wind-speed");
                    currentWindSpeed.text("Wind Speed: " + response.current.wind_speed + " MPH");

                    // current uv
                    var currentUvIndex = $("#current-uv-index");
                    currentUvIndex.text("UV Index: ");
                    var currentNumber = $("#current-number");
                    currentNumber.text(response.current.uvi);

                    
                    if (response.current.uvi <= 2) {
                        currentNumber.addClass("favorable");
                    } else if (response.current.uvi >= 3 && response.current.uvi <= 7) {
                        currentNumber.addClass("moderate");
                    } else {
                        currentNumber.addClass("severe");
                    }
                })
        })
        .catch(function(err) {
            // reset search input
            $("#search-input").val("");

            // error alert
            alert("Please search for a valid city.");
        });
};

var fiveDayForecastSection = function(cityName) {
    
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`http://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
               
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    console.log(response);

                    // 5 day forcast
                    var futureForecastTitle = $("#future-forecast-title");
                    futureForecastTitle.text("5-Day Forecast:")

                    
                    for (var i = 1; i <= 5; i++) {
                        
                        var futureCard = $(".future-card");
                        futureCard.addClass("future-card-details");

                      
                        var futureDate = $("#future-date-" + i);
                        date = moment().add(i, "d").format("M/D/YYYY");
                        futureDate.text(date);

                        
                        var futureIcon = $("#future-icon-" + i);
                        futureIcon.addClass("future-icon");
                        var futureIconCode = response.daily[i].weather[0].icon;
                        futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);

                       
                        var futureTemp = $("#future-temp-" + i);
                        futureTemp.text("Temp: " + response.daily[i].temp.day + " \u00B0F");

                       
                        var futureHumidity = $("#future-humidity-" + i);
                        futureHumidity.text("Humidity: " + response.daily[i].humidity + "%");
                    }
                })
        })
};


$("#search-form").on("submit", function() {
    event.preventDefault();
    
    // get city
    var cityName = $("#search-input").val();

    if (cityName === "" || cityName == null) {
        
        alert("Please enter name of city.");
        event.preventDefault();
    } else {
       
        currentWeatherSection(cityName);
        fiveDayForecastSection(cityName);
    }
});


$("#search-history-container").on("click", "p", function() {
    
    var previousCityName = $(this).text();
    currentWeatherSection(previousCityName);
    fiveDayForecastSection(previousCityName);

    //
    var previousCityClicked = $(this);
    previousCityClicked.remove();
});

loadSearchHistory();