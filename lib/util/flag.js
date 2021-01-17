'use strict'

module.exports = flag

// Check whether a word has a flag.
function flag(values, value, flags) {
  return flags && value in values && flags.indexOf(values[value]) > -1
}
