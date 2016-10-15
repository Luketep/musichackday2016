let Nuimo = require("nuimojs"),
    nuimo = new Nuimo();

nuimo.on("discover", (device) => {

    console.log(`Discovered Nuimo (${device.uuid})`);

    device.on("connect", () => {
        console.log("Nuimo connected");
    });

    device.on("press", () => {
        device.setLEDMatrix([
            1, 1, 0, 0, 0, 0, 0, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 1,
            0, 0, 0, 1, 0, 0, 1, 1, 0,
            0, 0, 0, 1, 0, 1, 0, 0, 0,
            0, 0, 0, 1, 0, 0, 1, 0, 0,
            0, 1, 0, 1, 0, 0, 0, 1, 0,
            0, 0, 1, 0, 0, 1, 1, 0, 0,
            1, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 0, 0, 0, 0, 0, 1, 1
        ], 255, 2000);
    });

    device.connect();

});

nuimo.scan();
