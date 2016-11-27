'use strict';

var has = require('has');

module.exports = flag;

/* Check whether a word has a flag. */
function flag(values, value, flags) {
  return flags &&
    has(values, value) &&
    flags.indexOf(values[value]) !== -1;
}
