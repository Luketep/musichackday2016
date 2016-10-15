'use strict';

var assign = require('lodash/object/assign'),
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

function ContextPadProvider(contextPad, modeling) {

  contextPad.registerProvider(this);

  this._contextPad = contextPad;
  this._modeling = modeling;
}

ContextPadProvider.$inject = [
  'contextPad',
  'modeling'
];

ContextPadProvider.prototype.getContextPadEntries = function(element) {

  var modeling = this._modeling;

  var actions = {};

  if (element.type === 'label') {
    return actions;
  }

  function removeElement(e) {
    if (element.waypoints) {
      modeling.removeConnection(element);
    } else {
      modeling.removeShape(element);
    }
  }

  if (isAny(element, [ 'bpmn:Task', 'bpmn:StartEvent', 'bpmn:EndEvent' ])) {
    assign(actions, {
      'delete': {
        group: 'edit',
        className: 'bpmn-icon-trash',
        title: 'Remove',
        action: {
          click: removeElement,
          dragstart: removeElement
        }
      }
    });
  }

  return actions;
};


module.exports = ContextPadProvider;