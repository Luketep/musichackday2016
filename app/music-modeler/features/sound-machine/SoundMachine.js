'use strict';

var pick = require('lodash/object/pick'),
    forEach = require('lodash/collection/forEach');

var Synthesizer = require('../synthesizer/Synthesizer'),
    Sampler = require('../sampler/Sampler');

function SoundMachine(audioContext, masterClock) {
  this._audioContext = audioContext;
  this._masterClock = masterClock;

  this._compressor = audioContext.createDynamicsCompressor();
  this._compressor.connect(audioContext.destination);
  this._compressor.threshold.value = -50;
  this._compressor.knee.value = 40;
  this._compressor.ratio.value = 12;
  // this._compressor.reduction.value = -20;
  this._compressor.attack.value = 0;
  this._compressor.release.value = 0.25;

  this._presets = {};

  this.initDefaults();
}

SoundMachine.$inject = [ 'audioContext', 'masterClock' ];

module.exports = SoundMachine;

SoundMachine.prototype.initDefaults = function() {

  // bell synthesizer
  var synthesizerBell = {
    label: 'Bell',
    type: 'instrument',
    preset: new Synthesizer(this._audioContext, this._compressor, {
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.1,
        release: 0.1,
        amplitude: 0.3
      },
      filter: {
        type: 'lowpass',
        q: '6',
        frequency: '2000'
      }
    })
  };

  this._presets.synthesizerBell = synthesizerBell;

  // lead synthesizer
  var synthesizerSquareLead = {
    label: 'Square Lead',
    type: 'instrument',
    preset: new Synthesizer(this._audioContext, this._compressor, {
      oscillator: {
        type: 'square'
      },
      envelope: {
        attack: 0.1,
        release: 0.1,
        amplitude: 0.3
      },
      filter: {
        type: 'lowpass',
        q: '6',
        frequency: '2000'
      },
      delay: {
        delayTime: 1,
        feedback: 0.5
      }
    })
  };

  this._presets.synthesizerSquarelead = synthesizerSquareLead;

  // saw pad
  var synthesizerSawPad = {
    label: 'Saw Pad',
    type: 'instrument',
    preset: new Synthesizer(this._audioContext, this._compressor, {
      oscillator: {
        type: 'sawtooth'
      },
      envelope: {
        attack: 0.1,
        release: 0.9,
        amplitude: 0.1
      },
      filter: {
        type: 'lowpass',
        q: '6',
        frequency: '2000'
      },
      delay: {
        delayTime: 5,
        feedback: 0.5
      }
    })
  };

  this._presets.synthesizerSawPad = synthesizerSawPad;

  // triangle synth
  var synthesizerTriangle = {
    label: 'Triangle',
    type: 'instrument',
    preset: new Synthesizer(this._audioContext, this._compressor, {
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.1,
        release: 0.9,
        amplitude: 0.1
      },
      filter: {
        type: 'lowpass',
        q: '6',
        frequency: '2000'
      },
      delay: {
        delayTime: 5,
        feedback: 0.5
      }
    })
  };

  this._presets.synthesizerTriangle = synthesizerTriangle;

  // glass synth
  var synthesizerGlass = {
    label: 'Glass',
    type: 'instrument',
    preset: new Synthesizer(this._audioContext, this._compressor, {
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.5,
        release: 1.0,
        amplitude: 0.1
      },
      filter: {
        type: 'highpass',
        q: '6',
        frequency: '3000'
      },
      delay: {
        delayTime: 5,
        feedback: 0.5
      }
    })
  };

  this._presets.synthesizerGlass = synthesizerGlass;

  // 808 kick
  var samplerKick = {
    label: '808 Kick',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/kick.wav',
      rootKey: 'c3'
    })
  };

  this._presets.samplerKick = samplerKick;

  // 808 clap
  var samplerClap = {
    label: '808 Clap',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/clap.wav',
      rootKey: 'c3'
    })
  };

  this._presets.samplerClap = samplerClap;

  // 808 clave
  var samplerClave = {
    label: '808 Clave',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/clave.wav',
      rootKey: 'c3'
    })
  };

  this._presets.samplerClave = samplerClave;

  // 808 closed hat
  var samplerClosedHat = {
    label: '808 Closed Hat',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/closedhat.wav',
      rootKey: 'c3'
    })
  };

  this._presets.samplerClosedHat = samplerClosedHat;

  // 808 cowbell
  var samplerCowbell = {
    label: '808 Cowbell',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/cowbell.wav',
      rootKey: 'c3'
    })
  };

  this._presets.samplerCowbell = samplerCowbell;

  // 808 crash
  var samplerCrash = {
    label: '808 Crash',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/crash.wav',
      rootKey: 'c3'
    })
  };

  this._presets.samplerCrash = samplerCrash;

  // 808 open hat
  var samplerOpenHat = {
    label: '808 Open Hat',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/openhat.wav',
      rootKey: 'c3'
    })
  };

  this._presets.samplerOpenHat = samplerOpenHat;

  // 808 rim
  var samplerRim = {
    label: '808 Rim',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/rim.wav',
      rootKey: 'c3'
    })
  };

  this._presets.samplerRim = samplerRim;

  // 808 snare
  var samplerSnare = {
    label: '808 Snare',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/snare.wav',
      rootKey: 'c3',
      delay: {
        delayTime: 2,
        feedback: 0.2
      }
    })
  };

  this._presets.samplerSnare = samplerSnare;

  // huh sample
  var huhSample = {
    label: 'Huh Vocal',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/huh-01.wav',
      rootKey: 'c3',
      delay: {
        delayTime: 2,
        feedback: 0.05
      }
    })
  };

  this._presets.huhSample = huhSample;

  // test
  var samplerKrush = {
    label: 'Krush',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/krush.wav',
      rootKey: 'c3',
      delay: {
        delayTime: 2,
        feedback: 0.2
      }
    })
  };

  this._presets.samplerKrush = samplerKrush;

  // 808 snare
  var ohYeahSample = {
    label: 'Oh YEAH Vocal',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/oh-yeah.wav',
      rootKey: 'c3',
      delay: {
        delayTime: 2,
        feedback: 0.05
      }
    })
  };

  this._presets.ohYeahSample = ohYeahSample;

  // test
  var samplerAlien = {
    label: 'Alien',
    type: 'drums',
    preset: new Sampler(this._audioContext, this._compressor, {
      url: 'samples/alien.wav',
      rootKey: 'c3',
      delay: {
        delayTime: 2,
        feedback: 0.2
      }
    })
  };

  this._presets.samplerAlien = samplerAlien;
};

SoundMachine.prototype.playSoundAt = function(sound, time) {
  if (!this._presets[sound.preset]) {
    throw new Error('preset not found');
  }

  this._presets[sound.preset].preset.playNoteAt(sound.note, time, this._masterClock._tempo);
};

SoundMachine.prototype.playPatches = function(sounds, time) {

  forEach(sounds, function(sound) {
    this.playSoundAt(sound, time);
  }, this);
};

SoundMachine.prototype.addSound = function(name, sound) {
  if (this._presets[name]) {
    throw new Error('sound with specified name already exists');
  }

  this._presets[name] = sound;
};

SoundMachine.prototype.removeSound = function(name) {
  if (!this._presets[name]) {
    return;
  }

  delete this._presets[name];
};

SoundMachine.prototype.getAll = function() {
  return this._presets;
};

SoundMachine.prototype.getSounds = function(type) {
  return pick(this._presets, function(preset) {
    return preset.type === type;
  });
};
