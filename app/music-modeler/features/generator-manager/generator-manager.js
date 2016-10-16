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

var assign = require('lodash/object/assign');

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
function GeneratorManager(eventBus, executor, elementRegistry, modeling, canvas, elementFactory, create) {
  this._eventBus = eventBus;
  this._executor = executor;
  this._elementRegistry = elementRegistry;
  this._modeling = modeling;
  this._canvas = canvas;
  this._elementFactory = elementFactory;

  eventBus.on('master-clock.start', function(context) {
    var numSteps = context.numSteps;

    this._numSteps = numSteps;
  }, this);

  var handleEnd = function(context) {
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
  };

  var handleMovement = function(context) {
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
  };

  var attachBo = function (shape, options) {
    var bo = shape.businessObject;

    if (options) {
      bo.di.isExpanded = options.isExpanded;

      if (options.preset) {
        bo.preset = options.preset;
      }

      if (options.note) {
        bo.note = options.note;
      }

      if (options.subDivision) {
        bo.subDivision = options.subDivision;
      }
    }
  };


  var createNewShape = function (context) {
    // new shape creation
    var options;
    var x = Math.round((context.coordinates.lat * 1000).toFixed(3).split('.')[1]);
    var y = Math.round((context.coordinates.long * 1000).toFixed(3).split('.')[1]);
    if (context.symbol === 'SIGNAL') {
      context.id = context.client;
      options = {
        type: 'bpmn:StartEvent',
        hidden: false,
        x : x,
        y : y,
        eventDefinitionType: "bpmn:MessageEventDefinition",
        client: context.client,
        subDivision: 4
      };
    } else if (context.symbol === 'DRUM') {
      context.id = context.client;
      options = {
        type: 'bpmn:ServiceTask',
        hidden: false,
        x : x,
        y : y,
        preset: 'samplerKick',
        client: context.client,
        note: 'c3'

      };
    } else if (context.symbol === 'CLAP') {
      context.id = context.client;
      options = {
        type: 'bpmn:ManualTask',
        hidden: false,
        x : x,
        y : y,
        preset: 'samplerClap',
        client: context.client,
        note: 'c3'
      };
    }
    if (context.uuid) {
      options.uuid = context.uuid;
    }
    if (context.preset) {
      options.preset = context.preset;
    }
    var shape = this._elementFactory.createShape(options);
    attachBo (shape,options);
    this._canvas.addShape(shape);
    context.shape = shape;
    handleEnd.bind(this)(context);
  };

  eventBus.on('api.client.event', function(context) {
    var existing = this._elementRegistry.filter(function(element) {
      return element.client === context.client;
    });

    if (existing.length && existing.length > 0) {
      if (existing[0].uuid) {
        context.uuid = existing[0].uuid;
        context.preset = existing[0].businessObject.preset;
        console.log(context.preset);
      }
      for (var i = 0; i < existing.length; i++) {
        this._canvas.removeShape(existing[i]);
      }
      createNewShape.bind(this)(context);
    } else {
      createNewShape.bind(this)(context);
    }
  }, this);

  eventBus.on('vocal.change', function(data) {
    var context = {};
    var options = {
      type: 'bpmn:ManualTask',
      hidden: false,
      x : 0,
      y : 0,
      preset: 'ohYeahSample',
      client: context.client,
      note: 'c3'
    };
    var shape = this._elementFactory.createShape(options);
    attachBo (shape,options);
    this._canvas.addShape(shape);
    context.shape = shape;
    handleEnd.bind(this)(context);
  }, this);

  eventBus.on('sample.change', function(data) {
    console.log(data);
    var latestElement;
    var existing = this._elementRegistry.filter(function(element) {
      if (element.businessObject.preset) {
        latestElement = element;
      }
      return element.uuid === data.uuid;
    });
    if (existing && existing.length > 0) {
      console.log(existing);
      existing[0].businessObject.preset = data.sample;
    } else {
      latestElement.businessObject.preset = data.sample;
      latestElement.uuid = data.uuid;
    }
  }, this);

  eventBus.on('create.end', handleEnd , this);

  eventBus.on('custom.create.end', function(context) {
    console.log(context);
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

  eventBus.on('shape.move.end', handleMovement, this);

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

GeneratorManager.$inject = [ 'eventBus', 'executor', 'elementRegistry', 'modeling', 'canvas', 'elementFactory', 'create' ];

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
