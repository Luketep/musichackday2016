'use strict';

var forEach = require('lodash/collection/forEach');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var domQuery = require('min-dom/lib/query'),
    domAttr = require('min-dom/lib/attr');

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

module.exports = function(group, element) {

  if (is(element, 'bpmn:EndEvent')) {

    var sounds = window.bpmnjs.get('soundMachine').getSounds('instrument');

    var selectOptions = [ { name: '', value: '' } ];

    forEach(sounds, function(sound, key) {
      selectOptions.push({ name: sound.label, value: key });
    });

    var selectBox = entryFactory.selectBox({
      id : 'preset',
      description : 'Select a preset',
      label : 'Preset',
      modelProperty : 'preset',
      selectOptions: selectOptions
    });

    group.entries.push(selectBox);

    var id = 'note',
        label = 'note';

    var resource = { id: id, label: label };

    resource.html = '<label for="camunda-preset">Note</label>' +
    '<div id="keyboard">' +
      '<div type="flat" id="c3"></div>' +
      '<div type="sharp" id="csharp3"></div>' +
      '<div type="flat" id="d3"></div>' +
      '<div type="sharp" id="dsharp3"></div>' +
      '<div type="flat" id="e3"></div>' +
      '<div type="flat" id="f3"></div>' +
      '<div type="sharp" id="fsharp3"></div>' +
      '<div type="flat" id="g3"></div>' +
      '<div type="sharp" id="gsharp3"></div>' +
      '<div type="flat" id="a3"></div>' +
      '<div type="sharp" id="asharp3"></div>' +
      '<div type="flat" id="b3"></div>' +
      '<div type="flat" id="c4"></div>' +
      '<div type="sharp" id="csharp4"></div>' +
      '<div type="flat" id="d4"></div>' +
    '</div>';

    resource.get = function(entry, node) {
      var note = entry.businessObject.get('note');

      if (note && node) {
        var noteNode = domQuery('#'+note.replace('#', 'sharp'), node);

        var activeNodes = domQuery('.active', node);

        if (activeNodes) {
          domAttr(activeNodes, 'class', '');
        }

        if (noteNode) {
          domAttr(noteNode, 'class', 'active');
        }
      }

    };

    group.entries.push(resource);
  }
};
