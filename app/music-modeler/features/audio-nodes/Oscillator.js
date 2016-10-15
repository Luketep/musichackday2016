'use strict';

function Oscillator(audioContext, config, frequency) {
    this.audioContext = audioContext;

    config = config || { type: 'sine' };

    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = config.type;
    this.oscillator.frequency.value = frequency || 440.0;
    this.oscillator.start(0);

    // configure input and output
    this.input = this.oscillator;
    this.output = this.oscillator;
}

Oscillator.prototype.connect = function(node) {

  if (node.hasOwnProperty('input')) {
    this.output.connect(node.input);
  } else {
    this.output.connect(node);
  }
};

module.exports = Oscillator;
