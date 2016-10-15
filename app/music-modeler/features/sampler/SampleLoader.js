'use strict';

module.exports.loadSample = function(audioContext, url, callback) {
  console.log('loading ' + url);

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    audioContext.decodeAudioData(request.response, function(buffer) {
      callback(buffer);
    }, onError);
  }

  request.send();
}

function onError() {
  throw new Error('error loading sample');
}
