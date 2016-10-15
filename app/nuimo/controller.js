var Pusher = require('pusher');

Pusher.logToConsole = true;

var pusher = new Pusher({
    app_id: "259586",
    key: "fe7f64b7bbd141ad1df0",
    secret: "379094cf97257b76228f"
});

let Nuimo = require("nuimojs"),
    nuimo = new Nuimo(),
    _ = require("lodash"),
    matrixLetters = require("./matrixletters");
    matrixVolume = require("./matrixvolume");

var instruments = [
  {name: "Base Drum", matrix: matrixLetters.BaseDrum},
  {name: "Snare", matrix: matrixLetters.Snare},
  {name: "Closed Hi-Hat", matrix: matrixLetters.ClosedHiHat},
  {name: "Open Hi-Hat", matrix: matrixLetters.OpenHiHat},
  {name: "Alien", matrix: matrixLetters.Alien}
];

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
        //TODO SEND SELECTION
        //device id + instrument
        console.log("instrument index", device.instrumentIndex);
        console.log(instruments[device.instrumentIndex].name);
        device.setLEDMatrix(instruments[device.instrumentIndex].matrix, 255, 2000);
      }
      //change pitch
      else {
        if (direction == Nuimo.Direction.UP) {
          console.log("Swiped up");
          //TODO send pitch + 1
        }
        if (direction == Nuimo.Direction.DOWN) {
          console.log("Swiped down");
          //TODO send pitch - 1
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

        pusher.trigger( 'private-settings-channel', 'gain', { gain: device.gain } );
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
