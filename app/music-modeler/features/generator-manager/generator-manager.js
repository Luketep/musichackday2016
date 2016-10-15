'use strict';

var find = require('lodash/collection/find'),
    forEach = require('lodash/collection/forEach');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var forEach = require('lodash/collection/forEach');

var Generator = require('./generator');

var getDistance = require('diagram-js/lib/util/Geometry').pointDistance,
    isMusicalEvent = require('../../util/MusicModelingUtil').isMusicalEvent;

var DEFAULT_DIVISION = 16; // just need divider coz: 1 / n

var MAX_DIST = 800;

/**
 * @example
 *
 * sounds: {
 *  0: [ { patch }, { patch }],
 *  4: [],
 *  8: [ { patch }],
 *  12: [],
 *  changed: [ 4 ]
 * }
 */
function GeneratorManager(eventBus, executor, elementRegistry, modeling) {
  this._eventBus = eventBus;
  this._executor = executor;
  this._elementRegistry = elementRegistry;
  this._modeling = modeling;

  eventBus.on('master-clock.start', function(context) {
    var numSteps = context.numSteps;

    this._numSteps = numSteps;
  }, this);

  eventBus.on('create.end', function(context) {
    var shape = context.shape;

    if (is(shape, 'bpmn:StartEvent')) {
      var generator = this.createNewGenerator(shape);

      var musicalElements = this._elementRegistry.filter(function(element) {
        return isMusicalEvent(element);
      });

      forEach(musicalElements, function(element) {

        if (getDistance(shape, element) <= MAX_DIST) {

          var stepNumber = generator.calculateStepNumber(shape, element);

          // register sound on generator
          generator.registerElement(stepNumber, element);

          modeling.connect(shape, element);
        }

      });
    }

    // if musical event
    if (isMusicalEvent(shape)) {
      this.inGeneratorRange(shape, function(generator, generatorShape, stepNumber) {
        if (stepNumber === null) {
          return;
        }

        // register sound on generator
        generator.registerElement(stepNumber, shape);

        modeling.connect(generatorShape, shape);
      });
    }
  }, this);

  eventBus.on('shape.removed', function(context) {
    var element = context.element;

    if (is(element, 'bpmn:StartEvent')) {
      executor.removeGenerator(element.id);
    }

    // if musical event
    if (isMusicalEvent(element)) {

      forEach(executor.getAllGenerators(), function(generator) {
        var stepNumber = generator.getStepNumFromSound(element);

        if (stepNumber) {
          generator.removeElement(element);
        }
      });

    }
  }, this);

  eventBus.on('shape.move.end', function(context) {
    var shape = context.shape,
        generator,
        generatorShape;

    if (isMusicalEvent(shape)) {

      this.inGeneratorRange(shape, function(generator, generatorShape, stepNumber) {
        this.connect(generator, generatorShape, shape, stepNumber);
      });
    } else {
      // generator moved
      generatorShape = shape;
      generator = executor.getGenerator(generatorShape.id);

      this.inElementRange(generator, generatorShape, function(shape, stepNumber) {
        this.connect(generator, generatorShape, shape, stepNumber);
      });
    }
  }, this);

  eventBus.on('elements.changed', function(context) {

    forEach(context.elements, function(element) {
      var newSubDivision,
          generator;

      // if it is a generator
      if (is(element, 'bpmn:StartEvent') && element.type !== 'label') {

        newSubDivision = element.businessObject.subDivision;

        generator = executor.getGenerator(element.id);

        if (generator) {
          generator.updateSubDivision(newSubDivision);
        }
      }
    }, this);

  }, this);
}

module.exports = GeneratorManager;

GeneratorManager.$inject = [ 'eventBus', 'executor', 'elementRegistry', 'modeling' ];

GeneratorManager.prototype.connect = function (generator, generatorShape, shape, stepNumber) {
  var modeling = this._modeling;

  var hasConnection = false,
      connection;

  if (!stepNumber) {
    forEach(generatorShape.outgoing, function(conn) {
      if (shape.incoming.indexOf(conn) !== -1) {
        connection = conn;

        return false;
      }
    });

    if (connection) {
      modeling.removeConnection(connection);

      generator.removeElement(shape);
    }

  } else {
    // register sound on generator
    generator.updateElement(stepNumber, shape);

    forEach(generatorShape.outgoing, function(connection) {
      if (shape.incoming.indexOf(connection) !== -1) {
        hasConnection = true;

        return false;
      }
    });

    if (!hasConnection) {
      modeling.connect(generatorShape, shape);
    }
  }
};

GeneratorManager.prototype.inElementRange = function(generator, generatorShape, fn) {
  var elementRegistry = this._elementRegistry;

  var elements = elementRegistry.filter(function(element) {
    return is(element, 'bpmn:Task') || is(element, 'bpmn:EndEvent');
  });

  forEach(elements, function(element) {

    if (getDistance(element, generatorShape) <= MAX_DIST) {

      var stepNumber = generator.calculateStepNumber(element, generatorShape);

      fn.call(this, element, stepNumber);
    } else {
      fn.call(this, element, null);
    }
  }, this);
};

GeneratorManager.prototype.inGeneratorRange = function(element, fn) {
  var elementRegistry = this._elementRegistry,
      executor = this._executor;

  var generators = executor.getAllGenerators();

  forEach(generators, function(generator) {
    var generatorShape = elementRegistry.get(generator.id);

    if (getDistance(element, generatorShape) <= MAX_DIST) {

      var stepNumber = generator.calculateStepNumber(element, generatorShape);

      fn.call(this, generator, generatorShape, stepNumber);
    } else {
      fn.call(this, generator, generatorShape, null);
    }
  }, this);
};

GeneratorManager.prototype.findGenerator = function(shape) {
  var executor = this._executor;

  var generators = executor.getAllGenerators();

  return find(generators, function(generator) {
    return generator.outgoing.indexOf(shape);
  });
};

GeneratorManager.prototype.exists = function(shape) {
  return !!this._executor._generators[shape.id];
};

GeneratorManager.prototype.createNewGenerator = function(shape) {
  var executor = this._executor;

  var numSteps = this._numSteps;

  var generator = new Generator(numSteps, DEFAULT_DIVISION, MAX_DIST);

  generator.id = shape.id;

  executor.registerGenerator(generator);

  return generator;
};
