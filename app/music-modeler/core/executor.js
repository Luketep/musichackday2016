'use strict';

var forEach = require('lodash/collection/forEach'),
    pick = require('lodash/object/pick');

function Executor(eventBus, audioContext, soundMachine) {
  this._eventBus = eventBus;
  this._audioContext = audioContext;
  this._soundMachine = soundMachine;

  this._generators = {};

  this._steps = {};

  eventBus.on('master-clock.start', function(context) {
    var numSteps = context.numSteps,
        idx = 0;

    this._steps.length = numSteps;

    for (idx; idx < numSteps; idx++) {
      this._steps[idx] = [];
    }
  }, this);

  eventBus.on('master-clock.tick', function(context) {
    // trigger sounds
    var elements = this.trigger(context.tick, context.nextNoteTime),
        idx = 0;

    if (!elements) {
      return;
    }

    for (idx; idx < elements.length; idx++) {
      eventBus.fire('element.play', { element: elements[idx] });
    }
  }, this);
}

module.exports = Executor;

Executor.$inject = [ 'eventBus', 'audioContext', 'soundMachine' ];


Executor.prototype.registerGenerator = function(generator) {
  this._generators[generator.id] = generator;
};

Executor.prototype.getGenerator = function(generator) {
  if (typeof generator === 'string') {
    return this._generators[generator];
  }

  return this._generators[generator.id];
};

Executor.prototype.getAllGenerators = function() {
  return this._generators;
};

Executor.prototype.removeGenerator = function(id) {
  delete this._generators[id];
};

Executor.prototype.trigger = function(tick, nextNoteTime) {
  var soundMachine = this._soundMachine;

  var generators = this.getAllGenerators(),
      generatorIds = Object.keys(generators),
      sounds = [],
      elements = [],
      idx = 0;

  for (idx; idx < generatorIds.length; idx++) {
    var step = generators[generatorIds[idx]].getStep(tick);

    if (step && step.length) {
      elements = elements.concat(step);
    }
  }

  if (!elements.length) {
    return;
  }

  for (idx = 0; idx < elements.length; idx++) {
    var element = elements[idx];

    sounds.push(pick(element.businessObject, [ 'preset', 'note' ]));
  }

  if (!sounds.length) {
    return;
  }
  console.log(JSON.stringify(sounds));
  soundMachine.playPatches(sounds, nextNoteTime);

  return elements;
};
