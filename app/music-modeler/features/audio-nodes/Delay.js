'use strict';

function Delay(audioContext, config, tempo) {
  this.audioContext = audioContext;
  this.tempo = tempo || 120.0;

  config = config || { delayTime: 0.3, feedback: 0.5 };

  this.delay = this.audioContext.createDelay();

  var delayTime = config.delayTime || 4;
  delayTime = (15 / this.tempo) * delayTime;

  this.delay.delayTime.value = delayTime;

  this.feedback = audioContext.createGain();
  this.feedback.gain.value = config.feedback || 0.5;

  this.delay.connect(this.feedback);
  this.feedback.connect(this.delay);

  // configure input and output
  this.input = this.delay;
  this.output = this.delay;
}

Delay.prototype.connect = function(node) {

  if (node.hasOwnProperty('input')) {
    this.output.connect(node.input);
  } else {
    this.output.connect(node);
  }
};

module.exports = Delay;
