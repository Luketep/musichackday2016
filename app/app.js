'use strict';

var propertiesPanelModule = require('bpmn-js-properties-panel'),
    propertiesProviderModule = require('./custom-properties-panel/providers/music'),
    musicModdleDescriptor = require('./custom-properties-panel/descriptors/music');

var MusicModeler = require('./music-modeler');

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
