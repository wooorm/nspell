'use strict'

var trim = require('./trim.js')
var parseCodes = require('./rule-codes.js')
var add = require('./add.js')

module.exports = parse

/* Expressions. */
var RE_WHITE_SPACE = /\s/g

/* Constants. */
var UTF8 = 'utf8'
var C_LINE = '\n'
var C_HASH = '#'
var C_SLASH = '/'
var C_ESCAPE = '\\'
var CC_TAB = '\t'.charCodeAt(0)

/* Parse a dictionary. */
function parse(buf, options, dict) {
  var index
  var last
  var value

  /* Parse as lines. */
  value = buf.toString(UTF8)
  last = value.indexOf(C_LINE) + 1
  index = value.indexOf(C_LINE, last)

  while (index !== -1) {
    if (value.charCodeAt(last) !== CC_TAB) {
      parseLine(value.slice(last, index), options, dict)
    }
    last = index + 1
    index = value.indexOf(C_LINE, last)
  }
  parseLine(value.slice(last), options, dict)
}

/* Parse a line in dictionary. */
function parseLine(line, options, dict) {
  var word
  var codes
  var result
  var hashOffset
  var slashOffset

  /* Find offsets. */
  slashOffset = line.indexOf(C_SLASH)
  while (slashOffset !== -1 && line.charAt(slashOffset - 1) === C_ESCAPE) {
    line = line.slice(0, slashOffset - 1) + line.slice(slashOffset)
    slashOffset = line.indexOf(C_SLASH, slashOffset)
  }

  hashOffset = line.indexOf(C_HASH)

  /* Handle hash and slash offsets.
   * Note that hash can be a valid flag, so we should not just
   * discard all string after it. */
  if (hashOffset >= 0) {
    if (slashOffset >= 0 && slashOffset < hashOffset) {
      word = line.slice(0, slashOffset)
      RE_WHITE_SPACE.lastIndex = slashOffset + 1
      result = RE_WHITE_SPACE.exec(line)
      codes = line.slice(slashOffset + 1, result ? result.index : undefined)
    } else {
      word = line.slice(0, hashOffset)
    }
  } else if (slashOffset >= 0) {
    word = line.slice(0, slashOffset)
    codes = line.slice(slashOffset + 1)
  } else {
    word = line
  }

  word = trim(word)
  if (word) {
    codes = parseCodes(options.flags, codes && trim(codes))
    add(dict, word, codes, options)
  }
}
