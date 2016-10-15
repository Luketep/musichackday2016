'use strict';

var Viewer = require('bpmn-js/lib/Viewer');

var inherits = require('inherits');

var Ids = require('ids');

var initialDiagram =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
                    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
                    'targetNamespace="http://bpmn.io/schema/bpmn" ' +
                    'id="Definitions_1">' +
    '<bpmn:process id="Process_1" isExecutable="false">' +
      '<bpmn:startEvent id="StartEvent_1"/>' +
    '</bpmn:process>' +
    '<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
      '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">' +
        '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">' +
          '<dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>' +
        '</bpmndi:BPMNShape>' +
      '</bpmndi:BPMNPlane>' +
    '</bpmndi:BPMNDiagram>' +
  '</bpmn:definitions>';


function MusicModeler(options) {
  Viewer.call(this, options);

  var eventBus = this.get('eventBus'),
      commandStack = this.get('commandStack');

  // eventBus.on('import.parse.start', function() {
  //   delete commandStack._handlerMap['label.create'];
  // });

  // hook ID collection into the modeler
  this.on('import.parse.complete', function(event) {
    if (!event.error) {
      this._collectIds(event.definitions, event.context);
    }
  }, this);

  this.on('diagram.destroy', function() {
    this.moddle.ids.clear();
  }, this);
}

inherits(MusicModeler, Viewer);

MusicModeler.prototype._modules = [].concat(
  [
    require('bpmn-js/lib/core'),
    require('diagram-js/lib/features/selection'),
    require('diagram-js/lib/features/overlays'),
    require('diagram-js/lib/features/auto-scroll'),
    require('diagram-js/lib/navigation/movecanvas'),
    require('diagram-js/lib/navigation/touch'),
    require('diagram-js/lib/navigation/zoomscroll'),
    require('diagram-js/lib/features/move'),
    require('diagram-js/lib/features/resize'),
    require('bpmn-js/lib/features/editor-actions'),
    require('bpmn-js/lib/features/context-pad'),
    require('bpmn-js/lib/features/keyboard'),
    require('bpmn-js/lib/features/modeling'),
    require('bpmn-js/lib/features/palette')
  ],
  [
    { audioContext: [ 'value', new window.AudioContext() ] },
    { bendpoints: [ 'type', function() {} ]},
    { labelEditingProvider: [ 'type', function() {} ]},
    { labelBehavior: [ 'type', function() {} ] },
    require('./core'),
    require('./features/generator-manager'),
    require('./features/harmony'),
    require('./features/context-pad'),
    require('./features/modeling'),
    require('./features/palette'),
    require('./features/sound-machine'),
    require('./features/visualizer'),
    require('./features/generator-visualizer')
  ]
);

module.exports = MusicModeler;

/**
 * Create a new diagram to start modeling.
 *
 * @param {Function} [done]
 */
MusicModeler.prototype.createDiagram = function(done) {
  return this.importXML(initialDiagram, done);
};

/**
 * Create a moddle instance, attaching ids to it.
 *
 * @param {Object} options
 */
MusicModeler.prototype._createModdle = function(options) {
  var moddle = Viewer.prototype._createModdle.call(this, options);

  // attach ids to moddle to be able to track
  // and validated ids in the BPMN 2.0 XML document
  // tree
  moddle.ids = new Ids([ 32, 36, 1 ]);

  return moddle;
};

/**
 * Collect ids processed during parsing of the
 * definitions object.
 *
 * @param {ModdleElement} definitions
 * @param {Context} context
 */
MusicModeler.prototype._collectIds = function(definitions, context) {

  var moddle = definitions.$model,
      ids = moddle.ids,
      id;

  // remove references from previous import
  ids.clear();

  for (id in context.elementsById) {
    ids.claim(id, context.elementsById[id]);
  }
};
