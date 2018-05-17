'use strict'

var parseCodes = require('./rule-codes.js')
var add = require('./add.js')

module.exports = parse

/* Constants. */
var UTF8 = 'utf8'
var C_LINE = '\n'
var C_SLASH = '/'
var C_ESCAPE = '\\'
var CC_TAB = '\t'.charCodeAt(0)

/* Parse a dictionary. */
function parse(buf, options, dict) {
  var index
  var line
  var word
  var codes
  var offset
  var last
  var value

  /* Parse as lines. */
  value = buf.toString(UTF8)
  last = value.indexOf(C_LINE) + 1
  index = value.indexOf(C_LINE, last)

  while (index !== -1) {
    if (value.charCodeAt(last) !== CC_TAB) {
      line = value.slice(last, index)
      word = line
      codes = []

      offset = line.indexOf(C_SLASH)

      while (offset !== -1) {
        if (line.charAt(offset - 1) !== C_ESCAPE) {
          word = line.slice(0, offset)
          codes = parseCodes(options.flags, line.slice(offset + 1))
          break
        }

        offset = line.indexOf(C_SLASH, offset + 1)
      }

      add(dict, word, codes, options)
    }

    last = index + 1
    index = value.indexOf(C_LINE, last)
  }
}
