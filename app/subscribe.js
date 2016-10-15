// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher('fe7f64b7bbd141ad1df0', {
    cluster: 'eu',
    encrypted: true
});

var channel = pusher.subscribe('mtg-channel');

var processGeolocation = function(location) {
    var coordinates = {lat: location.coords.latitude, long: location.coords.longitude};
    document.getElementsByClassName("location")[0].innerHTML = JSON.stringify(coordinates,null,2);
    var triggered = channel.trigger('location', coordinates);
};

var geolocationError = function(msg) {
    console.log("error")
};

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

var watchID = navigator.geolocation.watchPosition(processGeolocation,geolocationError, {
    timeout: 10000,
    enableHighAccuracy: true,
    maximumAge: Infinity
});