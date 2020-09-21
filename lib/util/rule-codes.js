'use strict'

module.exports = ruleCodes

var NO_CODES = []

// Parse rule codes.
function ruleCodes(flags, value) {
  var flag = flags.FLAG
  var result
  var length
  var index

  if (!value) return NO_CODES

  if (flag === 'long') {
    index = 0
    length = value.length

    result = new Array(Math.ceil(length / 2))

    while (index < length) {
      result[index / 2] = value.slice(index, index + 2)

      index += 2
    }

    return result
  }

  return value.split(flag === 'num' ? ',' : '')
}
