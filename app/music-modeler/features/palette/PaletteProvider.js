'use strict';

var assign = require('lodash/object/assign');

/**
 * A palette that allows you to create BPMN _and_ custom elements.
 */
function PaletteProvider(palette, create, elementFactory, spaceTool, lassoTool) {

  this._create = create;
  this._elementFactory = elementFactory;

  palette.registerProvider(this);
}

module.exports = PaletteProvider;

PaletteProvider.$inject = [ 'palette', 'create', 'elementFactory' ];


PaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      elementFactory = this._elementFactory;


  function createAction(type, group, className, title, options) {

    function createListener(event) {

      var shape = elementFactory.createShape(assign({ type: type }, options));

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

      create.start(event, shape);
    }

    var shortType = type.replace(/^bpmn\:/, '');

    return {
      group: group,
      className: className,
      title: title || 'Create ' + shortType,
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  function createParticipant(event, collapsed) {
    create.start(event, elementFactory.createParticipantShape(collapsed));
  }

  assign(actions, {
    'create.start-event': createAction(
      'bpmn:StartEvent',
      'generator',
      'bpmn-icon-start-event-message',
      'Create Generator',
      { eventDefinitionType: 'bpmn:MessageEventDefinition', subDivision: 4 }
    ),
    'generator-separator': {
      group: 'generator',
      separator: true
    },
    'create.error-end-event': createAction(
      'bpmn:EndEvent', 'instrument',
      'bpmn-icon-end-event-error',
      'Create Bell',
      { eventDefinitionType: 'bpmn:ErrorEventDefinition', preset: 'synthesizerBell', note: 'c3' }
    ),
    'create.escalation-end-event': createAction(
      'bpmn:EndEvent', 'instrument',
      'bpmn-icon-end-event-escalation',
      'Create Square Lead',
      { eventDefinitionType: 'bpmn:EscalationEventDefinition', preset: 'synthesizerSquarelead', note: 'e3' }
    ),
    'create.signal-end-event': createAction(
      'bpmn:EndEvent',
      'instrument',
      'bpmn-icon-end-event-signal',
      'Create Instrument C',
      { eventDefinitionType: 'bpmn:SignalEventDefinition' }
    ),
    'create.cancel-end-event': createAction(
      'bpmn:EndEvent',
      'instrument',
      'bpmn-icon-end-event-cancel',
      'Create Instrument D',
      { eventDefinitionType: 'bpmn:CancelEventDefinition' }
    ),
    'create.compensation-end-event': createAction(
      'bpmn:EndEvent',
      'instrument',
      'bpmn-icon-end-event-compensation',
      'Create Instrument E',
      { eventDefinitionType: 'bpmn:CompensateEventDefinition' }
    ),
    'instrument-separator': {
      group: 'instrument',
      separator: true
    },
    'create.service-task': createAction(
      'bpmn:ServiceTask',
      'drum',
      'bpmn-icon-service-task',
      'Create 808 Kick',
      { preset: 'samplerKick', note: 'c3' }
    ),
    'create.user-task': createAction(
      'bpmn:UserTask',
      'drum',
      'bpmn-icon-user-task',
      'Create 808 Snare',
      { preset: 'samplerSnare', note: 'c3'}
    ),
    'create.manual-task': createAction(
      'bpmn:ManualTask',
      'drum',
      'bpmn-icon-manual-task',
      'Create 808 Clap',
      { preset: 'samplerClap', note: 'c3'}
    ),
    'create.business-rule-task': createAction(
      'bpmn:BusinessRuleTask',
      'drum',
      'bpmn-icon-business-rule-task',
      'Create 808 Closed Hat',
      { preset: 'samplerClosedHat', note: 'c3'}
    ),
    'create.script-task': createAction(
      'bpmn:ScriptTask',
      'drum',
      'bpmn-icon-script-task',
      'Create 808 Open Hat',
      { preset: 'samplerOpenHat', note: 'c3'}
    ),
  });

  return actions;
};