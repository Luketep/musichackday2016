'use strict';

var forEach = require('lodash/collection/forEach');

var musicScale = require('music-scale');

var is = require('bpmn-js/lib/util/ModelUtil').is;


function Harmony(eventBus, elementRegistry) {
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;

  this._key = 'c';
  this._scale = 'major';
  this._availableNotes = musicScale(this._scale, this._key);


  eventBus.on('create.end', function(context) {
    var shape = context.shape;

    if (is(shape, 'bpmn:EndEvent')) {
      this.setRandomNote(shape);
    }
  }, this);

  eventBus.on('elements.changed', function(context) {

    forEach(context.elements, function(element) {
      var businessObject = element.businessObject;

      // if it is a generator
      if (is(element, 'bpmn:Process')) {
        this.update(businessObject);
      }
    }, this);

  }, this);
}

module.exports = Harmony;

Harmony.$inject = [ 'eventBus', 'elementRegistry' ];

Harmony.prototype.setRandomNote = function(shape, keepOctave) {
  var businessObject = shape.businessObject,
      availableNotes = this._availableNotes,
      availableLen = availableNotes.length - 1,
      randIndex = Math.round(Math.random() * availableLen),
      randOctave = Math.round(Math.random() * 3) + 2;

  if (keepOctave) {
    randOctave = businessObject.note.substr(-1);
  }

  businessObject.note = availableNotes[randIndex].toLowerCase() + randOctave;

  console.log(businessObject.note, businessObject.preset);
};

Harmony.prototype.update = function(businessObject) {
  var key = businessObject.key.replace('sharp', ''),
      scale = businessObject.scale;

  if (key !== this._key || scale !== this._scale) {
    this._key = key;
    this._scale = scale;

    this._availableNotes = musicScale(this._scale, this._key);

    this.updateNodes();
  }
};

Harmony.prototype.updateNodes = function() {
  var elementRegistry = this._elementRegistry;

  var instruments = elementRegistry.filter(function(element) {
    return is(element, 'bpmn:EndEvent');
  });

  forEach(instruments, function(instrument) {
    this.setRandomNote(instrument, true);
  }, this);
};
