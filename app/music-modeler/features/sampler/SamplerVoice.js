'use strict';

var BufferSource = require('../audio-nodes/BufferSource'),
    Filter = require('../audio-nodes/Filter'),
    Delay = require('../audio-nodes/Delay'),
    Reverb = require('../audio-nodes/Reverb');

function SamplerVoice(audioContext, bufferConfig, config, tempo) {
  this.audioContext = audioContext;

  if (!config) {
    throw new Error('no configuration found');
  }

  this.bufferSource = new BufferSource(this.audioContext, bufferConfig);

  this.lastNode = this.bufferSource;
  this.output = this.bufferSource;

  // optional filter
  if (config.filter) {
    var filter = new Filter(this.audioContext, config.filter);

    this.lastNode.connect(filter);

    this.lastNode = filter;
    this.output = filter;
  }

  // optional delay
  if (config.delay) {
    var delay = new Delay(this.audioContext, config.delay, tempo);

    this.lastNode.connect(delay);

    this.lastNode = delay;
    this.output = delay;
  }

  // optional reverb
  if (config.reverb) {
    var reverb = new Reverb(this.audioContext, config.reverb);

    this.lastNode.connect(reverb);

    this.lastNode = this.output = reverb;
  }

}

module.exports = SamplerVoice;

SamplerVoice.prototype.connect = function(node) {

  if (node.hasOwnProperty('input')) {
    this.output.connect(node.input);
  } else {
    this.output.connect(node);
  };

};

SamplerVoice.prototype.playAt = function(time) {

  this.bufferSource.playAt(time);

};
