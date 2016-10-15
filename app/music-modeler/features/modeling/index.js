module.exports = {
  __init__: [ 'modeling', 'bpmnUpdater' ],
  __depends__: [
    require('bpmn-js/lib/features/modeling/behavior'),
    require('bpmn-js/lib/features/label-editing'),
    require('bpmn-js/lib/features/rules'),
    require('bpmn-js/lib/features/ordering'),
    require('bpmn-js/lib/features/replace'),
    require('diagram-js/lib/command'),
    require('diagram-js/lib/features/tooltips'),
    require('diagram-js/lib/features/label-support'),
    require('diagram-js/lib/features/attach-support'),
    require('diagram-js/lib/features/selection'),
    require('diagram-js/lib/features/change-support'),
    require('diagram-js/lib/features/space-tool')
  ],
  bpmnFactory: [ 'type', require('bpmn-js/lib/features/modeling/BpmnFactory') ],
  bpmnUpdater: [ 'type', require('bpmn-js/lib/features/modeling/BpmnUpdater') ],
  elementFactory: [ 'type', require('bpmn-js/lib/features/modeling/ElementFactory') ],
  modeling: [ 'type', require('bpmn-js/lib/features/modeling/Modeling') ],

  // Use Base Layouter instead of Manhattan Layouter. w00t w00t!
  layouter: [ 'type', require('diagram-js/lib/layout/BaseLayouter') ],

  connectionDocking: [ 'type', require('diagram-js/lib/layout/CroppingConnectionDocking') ]
};
