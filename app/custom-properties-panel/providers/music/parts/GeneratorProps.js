'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

module.exports = function(group, element) {


  if (is(element, 'bpmn:StartEvent')) {
    group.entries.push(entryFactory.selectBox({
      id : 'subDivision',
      description : 'Specify the time division',
      label : 'Time Division',
      modelProperty : 'subDivision',
      selectOptions: [
        { name: '1/1', value: '1' },
        { name: '1/2', value: '2' },
        { name: '1/4', value: '4' },
        { name: '1/8', value: '8' },
        { name: '1/16', value: '16' }
      ]
    }));
  }
};