'use strict';

module.exports = {
  __init__: [ 'masterClock', 'executor' ],
  masterClock: [ 'type', require('./master-clock') ],
  executor: [ 'type', require('./executor') ]
};
