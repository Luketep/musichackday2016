'use strict';

var forEach = require('lodash/collection/forEach');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var MASTER_TEMPO = 120,
    NUM_STEPS = 16;

function MasterClock(eventBus, audioContext) {
  this._eventBus = eventBus;
  this._audioContext = audioContext;

  this._tempo = MASTER_TEMPO;
  this._isPlaying = false;

  this._activeTick = 0;

  this._nextNoteTime = 0.0;
  this._currentNote = 0.0;
  this._scheduleAheadTime = 0.3; // seconds


  eventBus.on('import.done', function() {
    this.init();
  }, this);

  eventBus.on('elements.changed', function(context) {

    var self = this;

    forEach(context.elements, function(element) {

      // if it is a generator
      if (is(element, 'bpmn:Process')) {

        var tempo = element.businessObject.tempo;

        if (self._tempo !== tempo) {
          self._tempo = tempo;
        }
      }
    });
  }, this);
}

module.exports = MasterClock;

MasterClock.$inject = [ 'eventBus', 'audioContext' ];


MasterClock.prototype.init = function() {
  var self = this,
      eventBus = this._eventBus;

  var worker = this.worker = new Worker('./lib/worker.js');

  worker.onmessage = function(e) {

    // run scheduler
    if (e.data === 'tick') {
      self.scheduler();
    }
  };

  worker.postMessage('start');

  eventBus.fire('master-clock.start', { numSteps: NUM_STEPS });
};

MasterClock.prototype.scheduler = function() {
  var audioContext = this._audioContext,
      eventBus = this._eventBus;

  // look ahead
  while (this._nextNoteTime < audioContext.currentTime + this._scheduleAheadTime ) {

    // schedule notes if any are registered for the current 16th note
    eventBus.fire('master-clock.tick', {
      tick: this._currentNote,
      nextNoteTime: this._nextNoteTime
    });

    this.nextNote();
  }
};

MasterClock.prototype.nextNote = function() {
  var secondsPerBeat = 60.0 / this._tempo; // change tempo to change tempo

  this._nextNoteTime += secondsPerBeat / 4;

  this._currentNote++;

  if (this._currentNote === NUM_STEPS) {
    this._currentNote = 0;
  }

  this._eventBus.fire('master-clock.next-note', {
    nextNoteTime: this._nextNoteTime,
    currentNote: this._currentNote
  });

};
