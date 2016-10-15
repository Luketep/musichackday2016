'use strict';

function BufferSource(audioContext, config) {
  this.audioContext = audioContext;

  if (!config) {
      throw new Error('no configuration found');
  }

  this.source = this.audioContext.createBufferSource();
  this.source.buffer = config.buffer;

  this.source.playbackRate.value = config.pitch;

  // configure output
  this.output = this.source;
}

BufferSource.prototype.playAt = function(time) {
  this.source.start(time);
};

BufferSource.prototype.connect = function(node) {

  if (node.hasOwnProperty('input')) {
    this.output.connect(node.input);
  } else {
    this.output.connect(node);
  }
};

module.exports = BufferSource;
