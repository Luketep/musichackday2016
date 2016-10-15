'use strict';

function Gain(audioContext) {
  this.audioContext = audioContext;

  this.gain = this.audioContext.createGain();

  this.gain.gain.value = 0;
  this.amplitude = this.gain.gain;

  // configure input and output
  this.input = this.gain;
  this.output = this.gain;
}

Gain.prototype.connect = function(node) {

  if (node.hasOwnProperty('input')) {
    this.output.connect(node.input);
  } else {
    this.output.connect(node);
  }
};

module.exports = Gain;
