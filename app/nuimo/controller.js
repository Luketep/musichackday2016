var Pusher = require('pusher');

Pusher.logToConsole = true;

var pusher = new Pusher({
    appId: "259586",
    key: "fe7f64b7bbd141ad1df0",
    host: "api-eu.pusher.com",
    secret: "379094cf97257b76228f"
});

let Nuimo = require("nuimojs"),
    nuimo = new Nuimo(),
    _ = require("lodash"),
    matrixLetters = require("./matrixletters");
    matrixVolume = require("./matrixvolume");

var instruments = [
  {name: "samplerKick", matrix: matrixLetters.BaseDrum},
  {name: "samplerSnare", matrix: matrixLetters.Snare},
  {name: "samplerClosedHat", matrix: matrixLetters.ClosedHiHat},
  {name: "samplerOpenHat", matrix: matrixLetters.OpenHiHat},
  {name: "samplerAlien", matrix: matrixLetters.Alien}
];

function callback(err, req, res) {
  if (err) {
    console.log("Du Hurensohn", err);
  }
}

const scale = 1/2800;

function clamp(x) {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

nuimo.on("discover", (device) => {

    console.log(`Discovered Nuimo (${device.uuid})`);
    device.instrumentIndex = 0;
    device.gain = 0.5;
    device.pitch = 0;
    device.on("connect", () => {
        console.log("Nuimo connected");
    });

    device.on("press", () => {
        console.log("Button pressed");
        pusher.trigger( 'private-settings-channel', 'vocal', {uuid: device.uuid}, callback );

    });

    device.on("release", () => {
        console.log("Button released");
    });

    device.on("swipe", (direction) => {
      //change instrument
      if (direction == Nuimo.Direction.LEFT || direction == Nuimo.Direction.RIGHT) {
        var shift = direction == Nuimo.Direction.LEFT ? -1 : 1;
        device.instrumentIndex = (device.instrumentIndex + shift) % instruments.length;
        if (device.instrumentIndex < 0) {
          device.instrumentIndex = instruments.length - 1;
        }
        //SEND SELECTION
        //device id + instrument
        console.log("instrument index", device.instrumentIndex);
        console.log(instruments[device.instrumentIndex].name);
        device.setLEDMatrix(instruments[device.instrumentIndex].matrix, 255, 2000);
        pusher.trigger( 'private-settings-channel', 'sample', { sample: instruments[device.instrumentIndex].name, uuid: device.uuid}, callback );

      }
      //change pitch
      else {
        if (direction == Nuimo.Direction.UP) {
          console.log("Swiped up");
          // send pitch + 1
          pusher.trigger( 'private-settings-channel', 'pitch', { pitch: 1, uuid: device.uuid}, callback );
        }
        if (direction == Nuimo.Direction.DOWN) {
          console.log("Swiped down");
          // send pitch - 1
          pusher.trigger( 'private-settings-channel', 'pitch', { pitch: -1, uuid: device.uuid}, callback );
        }
      }
    });

    device.on("rotate", (amount) => {
        console.log(`Rotated by ${amount}`);
        device.gain += scale * amount;
        //device.gain = _.clamp(device.gain, 0, 1); //not working :/
        device.gain = clamp(device.gain);
        device.setLEDMatrix(matrixVolume.getMatrix(device.gain), 255, 0);
        console.log("gain:", device.gain);

        pusher.trigger( 'private-settings-channel', 'gain', { gain: device.gain, uuid: device.uuid}, callback );
        //TODO SEND GAIN
        //device id
    });

    device.on("fly", (direction, speed) => {
        switch (direction) {
            case (Nuimo.Direction.LEFT):
                console.log(`Flew left by speed ${speed}`); break;
            case (Nuimo.Direction.RIGHT):
                console.log(`Flew right by speed ${speed}`); break;
        }
    });

    device.on("detect", (distance) => {
        console.log(`Detected hand at distance ${distance}`);
    });

    device.connect();

});

nuimo.scan();
