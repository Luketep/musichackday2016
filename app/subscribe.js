// Enable pusher logging - don't include this in production

navigator.permissions.query({name:'geolocation'});

Pusher.logToConsole = true;

var pusher = new Pusher('fe7f64b7bbd141ad1df0', {
    cluster: 'eu',
    encrypted: true
});

channel = pusher.subscribe('private-mtg-channel');

var processGeolocation = function(location) {
    coordinates = {lat: location.coords.latitude, long: location.coords.longitude};
    document.getElementsByClassName("location")[0].innerHTML = JSON.stringify(coordinates,null,2);
    if (symbol) submitUserInfo();
};

var processGeolocationChange = function(location) {
    coordinates = {lat: location.coords.latitude, long: location.coords.longitude};
    document.getElementsByClassName("location")[0].innerHTML = JSON.stringify(coordinates,null,2);
    //if (symbol) submitUserInfo();
};

var geolocationError = function(msg) {
    alert('error in location detection');
};

var submitUserInfo = function () {
    var data = {
        coordinates : coordinates,
        symbol : symbol,
        client: channel.pusher.sessionID
    };
    var triggered = channel.trigger('client-location', data);
};

handleTypeChange = function (event) {
    var e = document.getElementById("type-selection");
    symbol = e.options[e.selectedIndex].value;
    submitUserInfo();
};

initialized = false;

channel.bind('pusher:subscription_succeeded', function() {
    if (!initialized) {
        navigator.geolocation.getCurrentPosition(
            processGeolocation,
            // Optional settings below
            geolocationError,
            {
                timeout: 100000,
                enableHighAccuracy: true,
                maximumAge: Infinity
            }
        );
        initialized = true;
    }

});


var watchID = navigator.geolocation.watchPosition(processGeolocationChange,geolocationError, {
    timeout: 10000,
    enableHighAccuracy: true,
    maximumAge: Infinity
});