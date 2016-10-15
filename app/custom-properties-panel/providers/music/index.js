module.exports = {
  __init__: [ 'propertiesProvider', 'keyboardBehavior' ],
  propertiesProvider: [ 'type', require('./MusicPropertiesProvider') ],
  keyboardBehavior: [ 'type', require('./KeyboardBehavior') ]
};