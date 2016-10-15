'use strict';

var timer,
    interval = 100;

onmessage = function(e) {

  // start timer
  if (e.data === 'start') {
    console.log('timer start');

    timer = setInterval(function() {
      postMessage('tick');
    }, interval);
  }

  // stop timer
  else if (e.data === 'stop') {
    console.log('timer stop');

		clearInterval(timer);
		timer = undefined;
	}

}
