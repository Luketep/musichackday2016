// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher('fe7f64b7bbd141ad1df0', {
    cluster: 'eu',
    encrypted: true
});

var channel = pusher.subscribe('private-mtg-channel');

var processGeolocation = function(location) {
    coordinates = {lat: location.coords.latitude, long: location.coords.longitude};
    document.getElementsByClassName("location")[0].innerHTML = JSON.stringify(coordinates,null,2);
};

var geolocationError = function(msg) {
    alert('error in location detection');
};

var submitUserInfo = function () {
    var data = {
        coordinates : coordinates,
        symbol : symbol
    };
    var triggered = channel.trigger('client-location', data);
};

handleTypeChange = function (event) {
    var e = document.getElementById("type-selection");
    symbol = e.options[e.selectedIndex].value;
    submitUserInfo();
};


channel.bind('pusher:subscription_succeeded', function() {
    navigator.geolocation.getCurrentPosition(
        processGeolocation,
        // Optional settings below
        geolocationError,
        {
            timeout: 10000,
            enableHighAccuracy: true,
            maximumAge: Infinity
        }
    );
});


var watchID = navigator.geolocation.watchPosition(processGeolocation,geolocationError, {
    timeout: 10000,
    enableHighAccuracy: true,
    maximumAge: Infinity
});