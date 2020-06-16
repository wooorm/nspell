'use strict'

module.exports = ruleCodes

// Parse rule codes.
function ruleCodes(flags, value) {
  var flag = flags.FLAG
  var result = []
  var length
  var index

  if (!value) {
    return result
  }

  if (flag === 'long') {
    index = 0
    length = value.length

    while (index < length) {
      result.push(value.slice(index, index + 2))

      index += 2
    }

    return result
  }

  return value.split(flag === 'num' ? ',' : '')
}
