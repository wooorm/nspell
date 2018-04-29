'use strict'

var flag = require('./flag.js')

module.exports = exact

var own = {}.hasOwnProperty

/* Check spelling of `value`, exactly. */
function exact(context, value) {
  var data = context.data
  var flags = context.flags
  var codes = own.call(data, value) ? data[value] : null
  var compound
  var index
  var length

  if (codes) {
    return !flag(flags, 'ONLYINCOMPOUND', codes)
  }

  compound = context.compoundRules
  length = compound.length
  index = -1

  /* Check if this might be a compound word. */
  if (value.length >= flags.COMPOUNDMIN) {
    while (++index < length) {
      if (value.match(compound[index])) {
        return true
      }
    }
  }

  return false
}
