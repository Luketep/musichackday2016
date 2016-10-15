'use strict';

var Oscillator = require('../audio-nodes/Oscillator'),
    Gain = require('../audio-nodes/Gain'),
    EnvelopeGenerator = require('../audio-nodes/EnvelopeGenerator'),
    Filter = require('../audio-nodes/Filter'),
    Delay = require('../audio-nodes/Delay'),
    Reverb = require('../audio-nodes/Reverb');

function SynthesizerVoice (audioContext, config, frequency, tempo) {
  this.audioContext = audioContext;

  if (!config) {
    throw new Error('no configuration found');
  }

  if (!config.oscillator) {
    throw new Error('no oscillator config found');
  }

  // oscillator
  this.oscillator = new Oscillator(this.audioContext, config.oscillator, frequency);

  // gain
  this.gain = new Gain(this.audioContext);

  // envelope generator
  if (config.envelope) {
    this.envelope = new EnvelopeGenerator(this.audioContext, config.envelope);
  } else {
    this.envelope = new EnvelopeGenerator(this.audioContext, { attack: 0.0, release: 0.1 });
  }

  this.oscillator.connect(this.gain);
  this.envelope.connect(this.gain.amplitude);

  this.lastNode = this.output = this.gain;

  // optional filter
  if (config.filter) {
    var filter = new Filter(this.audioContext, config.filter);

    this.lastNode.connect(filter);

    this.lastNode = this.output = filter;
  }

  // optional delay
  if (config.delay) {
    var delay = new Delay(this.audioContext, config.delay, tempo);

    this.lastNode.connect(delay);

    this.lastNode = this.output = delay;
  }

  // optional reverb
  if (config.reverb) {
    var reverb = new Reverb(this.audioContext, config.reverb);

    this.lastNode.connect(reverb);

    this.lastNode = this.output = reverb;
  }

}

module.exports = SynthesizerVoice;

SynthesizerVoice.prototype.connect = function(node) {

  if (node.hasOwnProperty('input')) {
    this.output.connect(node.input);
  } else {
    this.output.connect(node);
  }
};

SynthesizerVoice.prototype.playAt = function(time) {

  this.envelope.triggerAt(time);
};
