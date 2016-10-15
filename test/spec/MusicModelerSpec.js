'use strict';

require('../TestHelper');

var forEach = require('lodash/collection/forEach');

var TestContainer = require('mocha-test-container-support');

var MusicModeler = require('../../app/music-modeler');


describe('custom modeler', function() {
  var xml = require('./diagram.bpmn');

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('music modeler', function() {

    var modeler;

    // spin up modeler with custom element before each test
    beforeEach(function(done) {
      modeler = new MusicModeler({ container: container });

      modeler.importXML(xml, function(err) {
        if (!err) {
          done();
        }
      });
    });

    describe('generators', function () {
      var generators;

      function registerSounds(sounds) {
        forEach(sounds, function(patches, stepNum) {
          forEach(patches, function(patch) {
            generators._insertSound(generators._steps, stepNum, patch);
          });
        });
      }

      beforeEach(function() {
        generators = modeler.get('generators');
      });

      it('should convert to smaller sub division', function() {
        // given
        var newSteps;

        registerSounds({
          0: [ 'a' ],
          4: [ 'b' ],
          8: [],
          12: [ 'c', 'd' ]
        });

        // when
        newSteps = generators.updateSubDivision(8);

        expect(newSteps).to.eql({
          0: [ 'a' ], 2: [],
          4: [ 'b' ], 6: [],
          8: [], 10: [],
          12: [ 'c', 'd' ], 14: [],
          changed: [ '0', '4', '12' ]
        });
      });


      it('should convert to larger sub division', function() {
        // given
        var newSteps;

        // reset the generators to 16ths
        generators.updateSubDivision(16);

        registerSounds({
          0: [ 'a' ],
          1: [ 'b' ],
          2: [],
          3: [ 'c', 'd' ],
          4: [],
          5: [],
          6: [],
          7: [ 'e', 'f', 'g' ],
          8: [ 'h' ],
          9: [],
          10: [],
          11: [ 'i', 'j' ],
          12: [],
          13: [],
          14: [ 'k', 'l' ],
          15: [ 'm', 'n' ]
        });

        // when
        newSteps = generators.updateSubDivision(8);

        expect(newSteps).to.eql({
          0: [ 'a', 'b' ], 2: [ 'c', 'd' ],
          4: [], 6: ['e', 'f', 'g' ],
          8: [ 'h' ], 10: [ 'i', 'j' ],
          12: [], 14: ['k', 'l', 'm', 'n' ],
          changed: [ 0, 2, 6, 10, 14 ]
        });
      });

      it('should only update the steps that got changed', function() {
        // given
        var newSteps;

        registerSounds({
          0: [ 'a' ],
          4: [ 'b' ],
          8: [],
          12: [ 'c', 'd' ]
        });

        // when
        newSteps = generators.scheduleSounds();

        expect(newSteps).to.eql({
          0: ['a'], 4: ['b'], 12: ['c', 'd']
        });
      });

    });

  });

});
