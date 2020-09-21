'use strict'

var flag = require('./flag.js')

module.exports = exact

// Check spelling of `value`, exactly.
function exact(context, value) {
  var data = context.data
  var flags = context.flags
  var codes = data[value]
  var compound
  var index
  var length

  if (codes) {
    return !flag(flags, 'ONLYINCOMPOUND', codes)
  }

  compound = context.compoundRules
  length = compound.length
  index = -1

  // Check if this might be a compound word.
  if (value.length >= flags.COMPOUNDMIN) {
    while (++index < length) {
      if (compound[index].test(value)) {
        return true
      }
    }
  }

  return false
}
