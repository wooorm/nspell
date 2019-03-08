'use strict'

var trim = require('./trim.js')
var parseCodes = require('./rule-codes.js')
var add = require('./add.js')

module.exports = parse

// Expressions.
var whiteSpaceExpression = /\s/g

// Constants.
var UTF8 = 'utf8'
var linefeed = '\n'
var numberSign = '#'
var slash = '/'
var backslash = '\\'
var tab = '\t'.charCodeAt(0)

// Parse a dictionary.
function parse(buf, options, dict) {
  var index
  var last
  var value

  // Parse as lines.
  value = buf.toString(UTF8)
  last = value.indexOf(linefeed) + 1
  index = value.indexOf(linefeed, last)

  while (index !== -1) {
    if (value.charCodeAt(last) !== tab) {
      parseLine(value.slice(last, index), options, dict)
    }

    last = index + 1
    index = value.indexOf(linefeed, last)
  }

  parseLine(value.slice(last), options, dict)
}

// Parse a line in dictionary.
function parseLine(line, options, dict) {
  var word
  var codes
  var result
  var hashOffset
  var slashOffset

  // Find offsets.
  slashOffset = line.indexOf(slash)
  while (slashOffset !== -1 && line.charAt(slashOffset - 1) === backslash) {
    line = line.slice(0, slashOffset - 1) + line.slice(slashOffset)
    slashOffset = line.indexOf(slash, slashOffset)
  }

  hashOffset = line.indexOf(numberSign)

  // Handle hash and slash offsets.  Note that hash can be a valid flag, so we
  // should not just discard all string after it.
  if (hashOffset >= 0) {
    if (slashOffset >= 0 && slashOffset < hashOffset) {
      word = line.slice(0, slashOffset)
      whiteSpaceExpression.lastIndex = slashOffset + 1
      result = whiteSpaceExpression.exec(line)
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
