'use strict'

var parse = require('./util/dictionary.js')

module.exports = add

/* Add a dictionary file. */
function add(buf) {
  var self = this
  var compound = self.compoundRules
  var compoundCodes = self.compoundRuleCodes
  var index = -1
  var length = compound.length
  var rule
  var source
  var character
  var offset
  var count

  parse(buf, self, self.data)

  /* Regenerate compound expressions. */
  while (++index < length) {
    rule = compound[index]
    source = ''

    offset = -1
    count = rule.length

    while (++offset < count) {
      character = rule.charAt(offset)

      if (compoundCodes[character].length === 0) {
        source += character
      } else {
        source += '(?:' + compoundCodes[character].join('|') + ')'
      }
    }

    compound[index] = new RegExp(source, 'i')
  }

  return self
}
