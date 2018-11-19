'use strict'

module.exports = normalize

// Normalize `value` with patterns.
function normalize(value, patterns) {
  var length = patterns.length
  var index = -1
  var pattern

  while (++index < length) {
    pattern = patterns[index]
    value = value.replace(pattern[0], pattern[1])
  }

  return value
}
