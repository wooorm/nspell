'use strict'

module.exports = flag

var own = {}.hasOwnProperty

/* Check whether a word has a flag. */
function flag(values, value, flags) {
  return flags && own.call(values, value) && flags.indexOf(values[value]) !== -1
}
