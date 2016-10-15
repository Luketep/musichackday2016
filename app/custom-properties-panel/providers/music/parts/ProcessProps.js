'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var domAttr = require('min-dom/lib/attr'),
    domQuery = require('min-dom/lib/query');

var is = require('bpmn-js/lib/util/ModelUtil').is;

function getHTML(id, label) {
  return '<label for="camunda-'+ id +'">'+ label +'</label>' +
    '<input id="camunda-'+ id +'" type="text" name="'+ id +'" />' +
    '<button class="plusMinusButton" data-action="change" style="position: relative;">-</button>' +
    '<button class="plusMinusButton" data-action="change" style="position: relative; display: inline-block">+</button>';
}

function change(element, node, event) {
  var input = domQuery('input', node);

  var operator = event.delegateTarget.innerHTML;

  if (input.value !== '') {
    var value = parseInt(input.value);

    if (value > 0) {

      var newValue;

      if (operator === '+') {
        newValue = value + 1;
      } else if (operator === '-') {
        newValue = value === 1 ? value : value - 1;
      }
      input.value = newValue;

      return true;
    }
  }
}

module.exports = function(group, element) {

  if (is(element, 'bpmn:Process')) {
    var tempoTextField = entryFactory.textField({
      id : 'tempo',
      description : 'Specify the overall tempo in BPM',
      label : 'Tempo',
      modelProperty : 'tempo'
    });

    tempoTextField.change = change;
    tempoTextField.html = getHTML('tempo', 'Tempo');

    group.entries.push(tempoTextField);

    var volumeTextField = entryFactory.textField({
      id : 'volume',
      description : 'Specify the main volume',
      label : 'Volume',
      modelProperty : 'volume',
    });

    volumeTextField.change = change;
    volumeTextField.html = getHTML('volume', 'Volume');

    group.entries.push(volumeTextField);

    var keySelectBox = entryFactory.selectBox({
      id : 'key',
      description : 'Specify the main key',
      label : 'Key',
      modelProperty : 'key',
      selectOptions: [
        { name: 'C', value: 'c' },
        { name: 'C#', value: 'csharp' },
        { name: 'D', value: 'd' },
        { name: 'D#', value: 'Dsharp' },
        { name: 'E', value: 'E' },
        { name: 'F', value: 'f' },
        { name: 'F#', value: 'fsharp' },
        { name: 'G', value: 'g' },
        { name: 'G#', value: 'gsharp' },
        { name: 'A', value: 'a' },
        { name: 'A#', value: 'asharp' },
        { name: 'B', value: 'b' }
      ]
    });

    group.entries.push(keySelectBox);

    var scaleSelectBox = entryFactory.selectBox({
      id : 'scale',
      description : 'Specify the main scale',
      label : 'Scale',
      modelProperty : 'scale',
      selectOptions: [
        { name: 'Major', value: 'major' },
        { name: 'Minor', value: 'minor' },
        { name: 'Melodic Minor', value: 'melodic minor' },
        { name: 'Dorian', value: 'dorian' },
        { name: 'Phrygian', value: 'phrygian' },
        { name: 'Mixolydian', value: 'mixolydian' },
        { name: 'Aeolian', value: 'aeolian' },
        { name: 'Locrian', value: 'locrian' },
      ]
    });

    group.entries.push(scaleSelectBox);
  }
};
