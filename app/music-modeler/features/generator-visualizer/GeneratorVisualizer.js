'use strict';

var Snap = require('diagram-js/vendor/snapsvg');

var forEach = require('lodash/collection/forEach');

var getDistance = require('diagram-js/lib/util/Geometry').pointDistance;

var MAX_DIST = 800;

function Token(eventBus, audioContext, canvas, executor, elementRegistry, masterClock) {
  this._audioContext = audioContext;
  this._executor = executor;
  this._elementRegistry = elementRegistry;
  this._masterClock = masterClock;

  this._layer = canvas.getLayer('impulses').group();
  this._ringLayer = canvas.getLayer('rings').group();
  this.rings = [];

  var self = this;

  eventBus.on('master-clock.next-note', function(context) {

    if (context.currentNote === 0) {

      // reset
      self._layer.clear();

      setTimeout(function() {

        forEach(self._executor.getAllGenerators(), function(generator) {
          var generatorShape = self._elementRegistry.get(generator.id);

          var circle = self._layer.circle(
            generatorShape.x + generatorShape.width / 2,
            generatorShape.y + generatorShape.height / 2,
            1).attr({
              fill: '#00f',
              strokeWidth: 0,
              fillOpacity: 0.5,
              pointerEvents: 'none'
          });

          var loopLengthInSeconds = 60 / self._masterClock._tempo * 4;

          circle.animate({ r: MAX_DIST, opacity: 0 }, loopLengthInSeconds * 1000);

        });

      }, context.nextNoteTime - self._audioContext.currentTime);
    }

  });

  eventBus.on([ 'create.move', 'shape.move.move' ], function(context) {
    var shape = context.shape;

    forEach(self._executor.getAllGenerators(), function(generator) {
      var generatorShape = self._elementRegistry.get(generator.id);

      // distance
      if (getDistance(
        { x: generatorShape.x, y: generatorShape.y },
        { x: shape.x, y: shape.y }
      ) < MAX_DIST && self.rings.indexOf(generator.id) < 0) {

        if (self.rings.indexOf(generator.id) < 0) {
          var subDivision = generator._subDivision;
          var ringRadiusStepSize = MAX_DIST / subDivision;

          for (var i = 1; i <= subDivision; i++) {
            self._layer.circle(
              generatorShape.x + generatorShape.width / 2,
              generatorShape.y + generatorShape.height / 2,
              i * ringRadiusStepSize).attr({
                fill: 'rgba(0, 0, 255, ' + (1 / subDivision * ( subDivision - i) * 0.05) + ')',
                strokeWidth: 0,
                pointerEvents: 'none'
            });
          }

          self.rings.push(generator.id);
        }

      } else if (self.rings.indexOf(generator.id) >= 0) {
        // TODO remove rings
      }



    });
  });

  eventBus.on([ 'create.end', 'shape.move.end' ], function(context) {
    console.log('removing');

    self._ringLayer.clear();
    self.rings = [];
  });

}

Token.$inject = [ 'eventBus', 'audioContext', 'canvas', 'executor', 'elementRegistry', 'masterClock' ];

module.exports = Token;
