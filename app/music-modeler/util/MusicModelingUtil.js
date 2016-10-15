'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is;

module.exports.isMusicalEvent = function(element) {

  // ignore labels
  return (is(element, 'bpmn:EndEvent') || is(element, 'bpmn:Task')) && !element.labelTarget;
};
