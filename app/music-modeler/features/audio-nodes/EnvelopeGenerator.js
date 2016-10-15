'use strict';

function EnvelopeGenerator(audioContext, config) {
  this.audioContext = audioContext;

  config = config || {};

  // defaults to gate behaviour
  this.attack = config.attack || 0.0;
  this.release = config.release || 0.0;
  this.amplitude = config.amplitude || 0.3;
}

// trigger with optional delay
EnvelopeGenerator.prototype.trigger = function(delay) {
  delay = delay || 0;

  var now = this.audioContext.currentTime;

  this.param.cancelScheduledValues(now + delay);
  this.param.setValueAtTime(0, now + delay);
  this.param.linearRampToValueAtTime(this.amplitude, now + delay + this.attack);
  this.param.linearRampToValueAtTime(0, now + delay + this.attack + this.release);
};

// trigger at specified time
EnvelopeGenerator.prototype.triggerAt = function(targetTime) {
  this.param.cancelScheduledValues(targetTime);
  this.param.setValueAtTime(0, targetTime);
  this.param.linearRampToValueAtTime(this.amplitude, targetTime + this.attack);
  this.param.linearRampToValueAtTime(0, targetTime + this.attack + this.release);
};

EnvelopeGenerator.prototype.connect = function(param) {
  this.param = param;
};

module.exports = EnvelopeGenerator;
