'use strict';

function Reverb(audioContext, config) {
  this.audioContext = audioContext;

  config = config || { duration: 5.0, decay: 5.0, reverse: false };

  this.convolver = audioContext.createConvolver();
  this.convolver.buffer = impulseResponse(
    audioContext,
    config.duration || 5.0,
    config.decay || 5.0,
    config.reverse || false
  );

  // configure input and output
  this.input = this.output = this.convolver;

}

Reverb.prototype.connect = function(node) {

  if (node.hasOwnProperty('input')) {
    this.output.connect(node.input);
  } else {
    this.output.connect(node);
  }
};

module.exports = Reverb;

function impulseResponse(audioContext, duration, decay, reverse) {
  var sampleRate = audioContext.sampleRate;
  var length = sampleRate * duration;
  var impulse = audioContext.createBuffer(2, length, sampleRate);
  var impulseL = impulse.getChannelData(0);
  var impulseR = impulse.getChannelData(1);

  if (!decay)
      decay = 2.0;

  for (var i = 0; i < length; i++){
    var n = reverse ? length - i : i;
    impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
  }

  return impulse;
}
