function toRadians(value) {
    return value * Math.PI / 180;
}

function getGeoDistance(lat1, lng1, lat2, lng2) {
    var R = 6371e3; // metres
    // var R = 6371; // KM
    var lat1Radians = toRadians(lat1);
    var lat2Radians = toRadians(lat2);
    var deltaLat = toRadians(lat2-lat1);
    var deltaLng = toRadians(lng2-lng1);

    var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1Radians) * Math.cos(lat2Radians) *
            Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;
    
    // Mapping to make sure we always have valid data in
    // case gps is not accurate enough
    if (d > 100) { d = 100; }
    else if (d < 1) { d = 1; } 
    
    return d;
}

function getAngleBetweenGeoLocations(lat1, lng1, lat2, lng2) {
    // a = azimuth L1, L2 = longitude B1, B2 = latitude
    // sin(a) = abs(L2-L1) / sqrt(sqr(L2-L1) + sqr(B2-B1))
    return Math.abs(lng2 - lng1) / Math.sqrt(Math.abs(lng2 - lng1)) + Math.sqrt(Math.abs(lat2 - lat1));
}

function mapGeoDistance(x) {
    // y = (x-A)/(B-A) * (D-C) + C
    
    var roomMin = 0;   //A
    var roomMax = 100; //B
    
    var gridMin = 0;   //C
    var gridMax = 800; //D
    
    return (x - roomMin) / (roomMax - roomMin) * (gridMax - gridMin) + gridMin;
}

function getPointForDistance(d, angle, point) {
    // dx = cos * hy
    // dy = sin * hy
    
    var dx = Math.cos(angle) * d;
    var dy = Math.sin(angle) * d;
    
    return {
        x: point.x + dx,
        y: point.y + dy
    };
}

/*
// EXAMPLE
var lat1 = 52.5336127;
var lng1 = 13.4310054;
var lat2 = 52.5336354;
var lng2 = 13.4310055;
var point = { x: 0, y: 0 };

var target = getTargetPosition(point, lat1, lng1, lat2, lng2);

//target = Object {x: 20.19307017275776, y: 0.006385609663201909}
*/
function getTargetPosition(origin, lat1, lng1, lat2, lng2) {
    var geoDistance = getGeoDistance(lat1, lng1, lat2, lng2);
    var distance = mapGeoDistance(geoDistance);
    var angle = getAngleBetweenGeoLocations(lat1, lng1, lat2, lng2);
    var target = getPointForDistance(distance, angle, origin);
    
    return target;    
}

module.exports.getTargetPosition = getTargetPosition;