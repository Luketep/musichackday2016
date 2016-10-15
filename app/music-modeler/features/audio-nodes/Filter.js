'use strict';

function Filter(audioContext, config) {
  this.audioContext = audioContext;

  config = config || { type: 'lowpass', q: 6, frequency: '2000.0' };

  this.filter = this.audioContext.createBiquadFilter();

  this.filter.type = config.type || 'lowpass';
  this.filter.Q.value = config.q || 6;
  this.filter.frequency.value = config.frequency || 2000.0;

  // configure input und output
  this.input = this.filter;
  this.output = this.filter;
}

Filter.prototype.connect = function(node) {

  if (node.hasOwnProperty('input')) {
    this.output.connect(node.input);
  } else {
    this.output.connect(node);
  }
};

module.exports = Filter;
