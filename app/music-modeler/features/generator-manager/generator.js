'use strict';

var find = require('lodash/collection/find'),
    findIndex = require('lodash/array/findIndex');

var getDistance = require('diagram-js/lib/util/Geometry').pointDistance;


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
function Generator(numSteps, subDivision, maxDistance) {
  this._steps = {
    changed: []
  };

  this._subDivision = subDivision;
  this.MAX_DIST = maxDistance;

  this.init(numSteps, subDivision);
}

module.exports = Generator;

/**
 * full: [ 0 ],
 * half: [ 0, 8 ],
 * quarter: [ 0, 4, 8, 12 ],
 * eigth: [ 0, 2, 4, 6, 8, 10, 12 ],
 * sixteenth: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ]
 *
 * @param  {Number} numSteps
 */
Generator.prototype.init = function(numSteps, subDivision) {
  var divider = numSteps / subDivision;

  this._steps = {
    changed: []
  };

  this._numSteps = numSteps;

  this.loopSteps(divider, function(step, index) {
    this._steps[index] = [];
  });
};

Generator.prototype.loopSteps = function(divider, fn) {
  var result;

  if (typeof divider === 'function') {
    fn = divider;
    divider = this.calcDivider();
  }

  for (var idx = 0; idx < this._numSteps; idx++) {
    if (idx % divider === 0) {
      result = fn.call(this, this._steps[idx], idx);

      if (result === false) {
        break;
      }
    }
  }
};


Generator.prototype.getStep = function(stepNumber) {
  return this._steps[stepNumber];
};

Generator.prototype.calcDivider = function() {
  return this._numSteps / this._subDivision;
};

/**
 * Updates the subdivision by moving sounds accordingly to their new steps depending
 * if the subdivision was increased or decreased.
 *
 * @param  {Number} newSubDivision
 *
 * @return {Sounds}
 */
Generator.prototype.updateSubDivision = function(newSubDivision) {
  var divider = this._numSteps / newSubDivision,
      oldDivider = this.calcDivider(),
      isSmaller = newSubDivision > this._subDivision,
      newSteps = {
        changed: []
      },
      stepCounter = 0;

  if (newSubDivision === this._subDivision) {
    return;
  }

  // update new subdivision
  this._subDivision = newSubDivision;

  // from 1/4 to 1/8 - no need to move sounds around
  if (isSmaller) {
    this.loopSteps(function(step, index) {
      if (!step) {
        this._steps[index] = [];
      }
    });

    return this._steps;
  }

  this.loopSteps(function(step, index) {
    newSteps[index] = [];
  });

  this.loopSteps(oldDivider, function(step, index) {
    // update the stepCounter whenever the index passes (divider * stepCounter + 1)
    if (index >= divider * (stepCounter + 1)) {
      stepCounter += 1;
    }

    if (step.length) {
      if (newSteps[index]) {
        newSteps[index] = step;
      } else {
        newSteps[divider * stepCounter] = newSteps[divider * stepCounter].concat(step);
      }
    }
  });

  this._steps = newSteps;

  return this._steps;
};

Generator.prototype.getStepNumFromSound = function(shape) {
  var stepNumber;

  this.loopSteps(function(step, stepIndex) {
    if (step.length) {
      stepNumber = find(step, shape) ? stepIndex : null;
    }
  });

  return stepNumber;
};

Generator.prototype.calculateStepNumber = function(shape, generatorManager) {

  var distance = getDistance(shape, generatorManager);

  var stepSize = this.MAX_DIST / this._subDivision;

  var stepNumber = Math.floor(distance / stepSize) * (16 / this._subDivision);

  return stepNumber;
};

Generator.prototype.registerElement = function(stepNumber, element) {
  this._insertSound(stepNumber, element);

  return this.getSchedule();
};

Generator.prototype.updateElement = function(stepNumber, element) {
  this.moveSound(stepNumber, element);

  return this.getSchedule();
};

/**
 * Moves sound to a new step number.
 *
 * @method moveSound
 *
 * @param  {[type]}  newStepNumber [description]
 * @param  {[type]}  sound         [description]
 *
 * @return {[type]}                [description]
 */
Generator.prototype.moveSound = function(newStepNumber, element) {
  this.removeElement(element);

  this._insertSound(newStepNumber, element);
};

Generator.prototype.removeElement = function(element) {
  var step, currIndex, removeIdx;

  this.loopSteps(function(step, stepIndex) {
    if (find(step, element)) {
      removeIdx = stepIndex;

      return false;
    }
  });

  if (typeof removeIdx === 'number') {
    step = this._steps[removeIdx];

    if (step) {
      currIndex = findIndex(step, element);

      step.splice(currIndex, 1);
    }
  }
};

// todo: figure out if it actually can be optimized with changed
Generator.prototype.getSchedule = function() {
  var sounds = {},
      steps = this._steps,
      divider;

  if (!steps.changed.length) {
    return;
  }

  divider = this._numSteps / this._subDivision;

  this.loopSteps(divider, function(step, index) {
    if (steps.changed.indexOf(index) !== -1) {
      sounds[index] = step;
    }
  });

  // reset changed
  steps.changed = [];

  return sounds;
};

Generator.prototype._insertSound = function(stepNumber, element) {
  this._steps[stepNumber].push(element);

  if (this._steps.changed.indexOf(stepNumber) === -1) {
    this._steps.changed.push(parseInt(stepNumber, 10));
  }
};
