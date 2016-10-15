'use strict';

var propertiesPanelModule = require('bpmn-js-properties-panel'),
    propertiesProviderModule = require('./custom-properties-panel/providers/music'),
    musicModdleDescriptor = require('./custom-properties-panel/descriptors/music');

var converter = require('./music-modeler/util/CoordinateConverter');
var MusicModeler = require('./music-modeler');



var coordinates = {};

var processGeolocation = function(location) {
    coordinates = {lat: location.coords.latitude, long: location.coords.longitude};
};

var processGeolocationChange = function(location) {
    coordinates = {lat: location.coords.latitude, long: location.coords.longitude};
};

var geolocationError = function(msg) {
    alert('error in location detection');
};

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

var modeler = new MusicModeler({
  container: '#canvas',
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    propertiesPanelModule,
    propertiesProviderModule
  ],
  moddleExtensions: {
    music: musicModdleDescriptor
  }
});

var initialDiagram =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
                    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
                    'xmlns:music="http://music" ' +
                    'targetNamespace="http://bpmn.io/schema/bpmn" ' +
                    'id="Definitions_1">' +
    '<bpmn:process id="Process_1" isExecutable="false"' +
    ' music:tempo="120" music:volume="50" music:key="c" music:scale="major">' +
    '</bpmn:process>' +
    '<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
      '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">' +
      '</bpmndi:BPMNPlane>' +
    '</bpmndi:BPMNDiagram>' +
  '</bpmn:definitions>';

modeler.importXML(initialDiagram, done);

function done() {
  // LOL
}

window.bpmnjs = modeler;

var pusher = new Pusher('fe7f64b7bbd141ad1df0', {
    cluster: 'eu',
    encrypted: true
});

var channel = pusher.subscribe('private-mtg-channel');
var settingsChannel = pusher.subscribe('private-settings-channel');

channel.bind('pusher:subscription_succeeded', function() {
    channel.bind('client-location',
        function(data) {
            data.clientCoordinates = converter.getTargetPosition({x: 0, y:0},coordinates.lat, coordinates.long, data.lat, data.long);
            bpmnjs._emit('api.client.event',data);
        }
    );

    settingsChannel.bind('gain', function (data) {
        bpmnjs._emit('gain.change',data);
    });
});


