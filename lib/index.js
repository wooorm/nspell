'use strict'

var buffer = require('is-buffer')
var affix = require('./util/affix.js')

module.exports = NSpell

var proto = NSpell.prototype

proto.correct = require('./correct.js')
proto.suggest = require('./suggest.js')
proto.spell = require('./spell.js')
proto.add = require('./add.js')
proto.remove = require('./remove.js')
proto.wordCharacters = require('./word-characters.js')
proto.dictionary = require('./dictionary.js')
proto.personal = require('./personal.js')

// Construct a new spelling context.
function NSpell(aff, dic) {
  var index = -1
  var dictionaries

  if (!(this instanceof NSpell)) {
    return new NSpell(aff, dic)
  }

  if (typeof aff === 'string' || buffer(aff)) {
    if (typeof dic === 'string' || buffer(dic)) {
      dictionaries = [{dic: dic}]
    }
  } else if (aff) {
    if ('length' in aff) {
      dictionaries = aff
      aff = aff[0] && aff[0].aff
    } else {
      if (aff.dic) {
        dictionaries = [aff]
      }

      aff = aff.aff
    }
  }

  if (!aff) {
    throw new Error('Missing `aff` in dictionary')
  }

  aff = affix(aff)

  this.data = Object.create(null)
  this.compoundRuleCodes = aff.compoundRuleCodes
  this.replacementTable = aff.replacementTable
  this.conversion = aff.conversion
  this.compoundRules = aff.compoundRules
  this.rules = aff.rules
  this.flags = aff.flags

  if (dictionaries) {
    while (++index < dictionaries.length) {
      if (dictionaries[index].dic) {
        this.dictionary(dictionaries[index].dic)
      }
    }
  }
}
