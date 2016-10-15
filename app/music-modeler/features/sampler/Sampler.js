'use strict';

var parser = require('note-parser');

var SamplerVoice = require('./SamplerVoice'),
    loadSample = require('./SampleLoader').loadSample;

function Sampler(audioContext, output, config) {
  this._audioContext = audioContext;
  this._output = output;

  if (!config) {
    throw new Error('no configuration found');
  }

  if (!config.url) {
    throw new Error('no url found');
  }

  this._sampleBuffer;

  var that = this;

  loadSample(this._audioContext, config.url, function(buffer) {
    console.log(config.url + ' loaded');

    that._sampleBuffer = buffer;
  });

  this._config = config;
}

module.exports = Sampler;

Sampler.prototype.playFrequencyAt = function(frequency, time, tempo) {

  var rootKey = this._config.rootKey || 'c3';
  var rootKeyFrequency = parser.parse(rootKey).freq;
  var pitch = frequency / rootKeyFrequency;

  var samplerVoice = new SamplerVoice(this._audioContext, {
    buffer: this._sampleBuffer,
    pitch: pitch
  }, this._config, tempo);

  samplerVoice.connect(this._output);
  samplerVoice.playAt(time);

};

Sampler.prototype.playNoteAt = function(note, time, tempo) {
  if (!this._sampleBuffer) {

    // sample not loaded
    return;
  }

  var note = note.replace('sharp', '#');

  var frequency = parser.parse(note).freq; // => { letter: 'C', acc: '#', ... midi: 61, freq: 277.1826309768721 }

  this.playFrequencyAt(frequency, time, tempo);

};
