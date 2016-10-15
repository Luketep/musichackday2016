let Nuimo = require("nuimojs"),
    nuimo = new Nuimo(),
    _ = require("lodash"),
    matrixLetters = require("./matrixletters");

var instruments = [
  {name: "Base Drum", matrix: matrixLetters.BaseDrum},
  {name: "Snare", matrix: matrixLetters.Snare},
  {name: "Closed Hi-Hat", matrix: matrixLetters.ClosedHiHat}
];

nuimo.on("discover", (device) => {

    console.log(`Discovered Nuimo (${device.uuid})`);
    device.instrumentIndex = 0;
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
