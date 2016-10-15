'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is;

function Visualizer(eventBus, overlays) {

  eventBus.on('element.play', function(context) {

    var element = context.element;
    var html;

    if (is(element, 'bpmn:Task')) {
      html = '<div style="width: 110px; height: 90px; background-color: rgba(82, 180, 21, 0.5); border-radius: 10px"></div>';
    }

    if (is(element, 'bpmn:EndEvent')) {
     html = '<div style="width: 46px; height: 46px; background-color: rgba(255, 0, 0, 0.5); border-radius: 23px"></div>';
    }

    var overlayId = overlays.add(element, {
      position: {
        top: -5,
        left: -5
      },
      html: html
    });

    setTimeout(function() { overlays.remove(overlayId)}, 200);

  });
}

Visualizer.$inject = [
  'eventBus',
  'overlays'
];

module.exports = Visualizer;