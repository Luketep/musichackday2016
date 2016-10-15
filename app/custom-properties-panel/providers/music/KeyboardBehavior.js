'use strict';

var domDelegate = require('min-dom/lib/delegate');

function KeyboardBehavior(eventBus, modeling) {


  // assign correct shape position unless already set

  eventBus.on('selection.changed', function(context) {

    var keyboard = document.getElementById('keyboard');

    var selection = context.newSelection[0];

    if (keyboard && selection) {
      domDelegate.bind(keyboard, 'div', 'click', function(event) {

        modeling.updateProperties(selection, { 'note': event.target.id });
      });
    }

  }, true);
}


KeyboardBehavior.$inject = [ 'eventBus', 'modeling' ];

module.exports = KeyboardBehavior;