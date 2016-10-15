'use strict';

var parser = require('note-parser');

var SynthesizerVoice = require('./SynthesizerVoice');

var Reverb = require('../audio-nodes/Reverb');

function Synthesizer(audioContext, output, config) {

  this._audioContext = audioContext;

  this._reverb = new Reverb(this._audioContext, {
    duration: 1,
    decay: 0.5,
    reverse: false
  });

  this._output = output;

  this._gain = this._audioContext.createGain();
  this._gain.gain.value = 0.1;

  // this._reverb.connect(this._gain);
  this._gain.connect(this._output);

  if (!config) {
    throw new Error('no configuration found');
  }

  if (!config.oscillator) {
    throw new Error('no oscillator config found');
  }

  this._config = config;
}

module.exports = Synthesizer;

Synthesizer.prototype.playFrequencyAt = function(frequency, time, tempo) {

  var synthesizerVoice = new SynthesizerVoice(this._audioContext, this._config, frequency, tempo);

  // TODO connect to reverb!
  synthesizerVoice.connect(this._gain);
  synthesizerVoice.playAt(time);
};

Synthesizer.prototype.playNoteAt = function(note, time, tempo) {

  note = note.replace('sharp', '#');

  var frequency = parser.parse(note).freq; // => { letter: 'C', acc: '#', ... midi: 61, freq: 277.1826309768721 }

  this.playFrequencyAt(frequency, time, tempo);
};
