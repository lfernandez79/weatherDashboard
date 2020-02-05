// creating date with moment
var currentDate = moment().format("MM/DD/YYYY hh:mm");


// all my variables to be use later
var apiKey = "7c105390d98ff6848c31520f58e748af";
var city = "";
var searchedCities = [];
var icon = $("<img>");
var currentCity = $("#city-name");




$(document).ready(function () {
    renderSearchHistory();

    // save users searches as list in the page

    function renderSearchHistory() {

        $(".list-group").empty();
        searchedCitiesString = localStorage.getItem("searchedCities");

        searchedCities = JSON.parse(searchedCitiesString);
        if (searchedCities === null) {
            searchedCities = [];
        }
        console.log(searchedCities);

        searchedCities.forEach(function (searchedCity) {
            var liElement = $("<li class=list-group-item>");
            liElement.addClass("city-list");
            liElement.text(searchedCity);

        // Added icon to delete localSotarge entries from https://icons8.com/icons/set/delete

            var trashIcon = $("<img src=https://img.icons8.com/office/30/000000/delete-sign.png>");
            trashIcon.addClass("delete-icon");
            liElement.append(trashIcon);
            $(".list-group").append(liElement);
        });
    }


    //  Apis to get weather and UV from Open weather 

    function getWeather(userCity) {

        var urlQuery = `https://api.openweathermap.org/data/2.5/weather?q=${userCity}&APPID=${apiKey}&units=imperial`;

        currentCity.text(userCity + " " + currentDate + " ");

        $.ajax({
            url: urlQuery,
            method: "GET"
        }).done(function (response) {
            console.log("current city response", response);

            function renderCurrentConditions() {

                var iconcode = response.weather[0].icon;

                var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
                icon.attr('src', iconurl);
                currentCity.append(icon);


                $("#city-temp").text("Temperature: " + response.main.temp + "°F");
                $("#city-humidity").text("Humidity: " + response.main.humidity + "%");
                $("#city-wind-speed").text("Wind Speed: " + response.wind.speed);

            }

            var latitude = response.coord.lat;
            var longitude = response.coord.lon;

            var uvIndexUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&;lon=${longitude}&APPID=${apiKey}`;
            renderCurrentConditions();

            $.ajax({
                url: uvIndexUrl,
                method: "GET"
            }).done(function (response) {
                console.log(response);
                $("#error").addClass("hide");
                $("#city-uv-index").text("UV Index: " + response.value);
                $("#welcome").addClass("hide");
                $("#weather").removeClass("hide");

            });
        }).fail(function (error) {
            $("#error").removeClass("hide");
            $("#welcome").addClass("hide");
            $("#weather").addClass("hide");
            $("#forecast").addClass("hide");
            $("#cards").addClass("hide");

            console.log("City does not exist", error);
        });


        // Get 5 days forecast 

        var forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${userCity}&mode=json&APPID=${apiKey}&units=imperial`;

        $.ajax({
            url: forecastUrl,
            method: "GET"
        }).done(function (response) {
            console.log("forecast info", response);

            var j = 1;
            for (var i = 5; i < response.list.length; i = i + 8) {
                $("#day-" + j).text(response.list[i].dt_txt);
                var iconcode = response.list[i].weather[0].icon;
                var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
                $("#icon-" + j).attr("src", iconurl);
                $("#temp-" + j).text("Temp: " + response.list[i].main.temp + "°F");
                $("#humidity-" + j).text("Humidity: " + response.list[i].main.humidity + "%");
                j++;
            }
            $("#error").addClass("hide");
            $("#forecast").removeClass("hide");
            $("#cards").removeClass("hide");

        });

    }

    // attach to the document because the list items were created dynamically
    $(document).on("click", ".city-list", function (event) {
        var buttonText = $(this).text();
        getWeather(buttonText);

        // if ($(this).hasClass("delete-icon")) {
        //     buttonText = ""
        // } else {
        //     getWeather(buttonText);
        // }
    });

    // Delete searched city on trash icon click
    $(document).on("click", ".delete-icon", function (event) {
        var deletedCity = $(this).parent().text();

        searchedCitiesString = localStorage.getItem("searchedCities");
        searchedCities = JSON.parse(searchedCitiesString);

        searchedCities = searchedCities.filter(city => {
            return city != deletedCity;
        });

        localStorage.setItem("searchedCities", JSON.stringify(searchedCities));

        renderSearchHistory();

        location.reload();
    });


    // =================== CLICK EVENT HANDLER ON SEARCH BUTTON ===================

    // click event for search btn
    $("#search-btn").on("click", function (event) {
        event.preventDefault();

        if ($("#searched-city").val() != "") {
            // get the value of the user's search
            city = $("#searched-city").val();

            // add searched city to searchedCities array
            searchedCities.push(city);
            localStorage.setItem("searchedCities", JSON.stringify(searchedCities));

            renderSearchHistory();

            getWeather(city);
        }

        $("#searched-city").val("");

    });

});