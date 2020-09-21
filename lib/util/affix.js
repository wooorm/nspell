'use strict'

var parse = require('./rule-codes.js')

module.exports = affix

// Rule types.
var onlyInCompoundType = 'ONLYINCOMPOUND'
var compoundRuleType = 'COMPOUNDRULE'
var compoundInType = 'COMPOUNDMIN'
var wordCharsType = 'WORDCHARS'
var keepCaseFlag = 'KEEPCASE'
var noSuggestType = 'NOSUGGEST'
var iconvType = 'ICONV'
var oconvType = 'OCONV'
var flagType = 'FLAG'
var prefixType = 'PFX'
var suffixType = 'SFX'
var replaceType = 'REP'
var tryType = 'TRY'
var keyType = 'KEY'

// Constants.
var combineable = 'Y'

// Relative frequencies of letters in the English language.
var alphabet = 'etaoinshrdlcumwfgypbvkjxqz'.split('')

// Expressions.
var whiteSpaceExpression = /\s+/

// Characters.
var linefeed = '\n'
var dollarSign = '$'
var caret = '^'
var slash = '/'
var dot = '.'
var digit0 = '0'
var numberSign = '#'.charCodeAt(0)

// Defaults.
var defaultCompoundInType = 3

var defaultKeyboardLayout = [
  'qwertzuop',
  'yxcvbnm',
  'qaw',
  'say',
  'wse',
  'dsx',
  'sy',
  'edr',
  'fdc',
  'dx',
  'rft',
  'gfv',
  'fc',
  'tgz',
  'hgb',
  'gv',
  'zhu',
  'jhn',
  'hb',
  'uji',
  'kjm',
  'jn',
  'iko',
  'lkm'
]

var push = [].push

// Parse an affix file.
// eslint-disable-next-line complexity
function affix(aff) {
  var rules = {}
  var replacementTable = []
  var conversion = {in: [], out: []}
  var compoundRuleCodes = {}
  var lines = []
  var flags = {}
  var compoundRules = []
  var index
  var length
  var parts
  var line
  var ruleType
  var entries
  var count
  var remove
  var add
  var source
  var entry
  var ruleLength
  var position
  var rule
  var last
  var value
  var offset
  var character

  flags[keyType] = []

  // Process the affix buffer into a list of applicable lines.
  aff = aff.toString('utf8')
  index = aff.indexOf(linefeed)
  last = 0

  while (index !== -1) {
    pushLine(aff.slice(last, index))
    last = index + 1
    index = aff.indexOf(linefeed, last)
  }

  pushLine(aff.slice(last))

  // Process each line.
  index = -1
  length = lines.length

  while (++index < length) {
    line = lines[index]
    parts = line.split(whiteSpaceExpression)
    ruleType = parts[0]

    if (ruleType === replaceType) {
      count = index + parseInt(parts[1], 10)

      while (++index <= count) {
        parts = lines[index].split(whiteSpaceExpression)
        replacementTable.push([parts[1], parts[2]])
      }

      index = count
    } else if (ruleType === iconvType || ruleType === oconvType) {
      entry = conversion[ruleType === iconvType ? 'in' : 'out']
      count = index + parseInt(parts[1], 10)

      while (++index <= count) {
        parts = lines[index].split(whiteSpaceExpression)

        entry.push([new RegExp(parts[1], 'g'), parts[2]])
      }

      index = count
    } else if (ruleType === compoundRuleType) {
      count = index + parseInt(parts[1], 10)

      while (++index <= count) {
        rule = lines[index].split(whiteSpaceExpression)[1]
        ruleLength = rule.length
        position = -1

        compoundRules.push(rule)

        while (++position < ruleLength) {
          compoundRuleCodes[rule.charAt(position)] = []
        }
      }

      index = count
    } else if (ruleType === prefixType || ruleType === suffixType) {
      count = index + parseInt(parts[3], 10)
      entries = []

      rule = {
        type: ruleType,
        combineable: parts[2] === combineable,
        entries: entries
      }

      rules[parts[1]] = rule

      while (++index <= count) {
        parts = lines[index].split(whiteSpaceExpression)
        remove = parts[2]
        add = parts[3].split(slash)
        source = parts[4]

        entry = {
          add: '',
          remove: '',
          match: '',
          continuation: parse(flags, add[1])
        }

        if (add && add[0] !== digit0) {
          entry.add = add[0]
        }

        try {
          if (remove !== digit0) {
            entry.remove = ruleType === suffixType ? end(remove) : remove
          }

          if (source && source !== dot) {
            entry.match = (ruleType === suffixType ? end : start)(source)
          }
        } catch (_) {
          // Ignore invalid regex patterns.
          entry = null
        }

        if (entry) {
          entries.push(entry)
        }
      }

      index = count
    } else if (ruleType === tryType) {
      source = parts[1]
      count = source.length
      offset = -1
      value = []

      while (++offset < count) {
        character = source.charAt(offset)

        if (character.toLowerCase() === character) {
          value.push(character)
        }
      }

      // Some dictionaries may forget a character.  Notably the enUS forgets
      // the `j`, `x`, and `y`.
      offset = -1
      count = alphabet.length

      while (++offset < count) {
        character = alphabet[offset]

        if (source.indexOf(character) === -1) {
          value.push(character)
        }
      }

      flags[ruleType] = value
    } else if (ruleType === keyType) {
      push.apply(flags[ruleType], parts[1].split('|'))
    } else if (ruleType === compoundInType) {
      flags[ruleType] = Number(parts[1])
    } else if (ruleType === onlyInCompoundType) {
      // If we add this ONLYINCOMPOUND flag to `compoundRuleCodes`, then
      // `parseDic` will do the work of saving the list of words that are
      // compound-only.
      flags[ruleType] = parts[1]
      compoundRuleCodes[parts[1]] = []
    } else if (
      ruleType === keepCaseFlag ||
      ruleType === wordCharsType ||
      ruleType === flagType ||
      ruleType === noSuggestType
    ) {
      flags[ruleType] = parts[1]
    } else {
      // Default handling.  Set them for now.
      flags[ruleType] = parts[1]
    }
  }

  // Default for `COMPOUNDMIN` is `3`.  See man 4 hunspell.
  if (isNaN(flags[compoundInType])) {
    flags[compoundInType] = defaultCompoundInType
  }

  if (flags[keyType].length === 0) {
    flags[keyType] = defaultKeyboardLayout
  }

  /* istanbul ignore if - Dictionaries seem to always have this. */
  if (!flags[tryType]) {
    flags[tryType] = alphabet.concat()
  }

  if (!flags[keepCaseFlag]) {
    flags[keepCaseFlag] = false
  }

  return {
    compoundRuleCodes: compoundRuleCodes,
    replacementTable: replacementTable,
    conversion: conversion,
    compoundRules: compoundRules,
    rules: rules,
    flags: flags
  }

  function pushLine(line) {
    line = line.trim()

    // Hash can be a valid flag, so we only discard line that starts with it.
    if (line && line.charCodeAt(0) !== numberSign) {
      lines.push(line)
    }
  }
}

// Wrap the `source` of an expression-like string so that it matches only at
// the end of a value.
function end(source) {
  return new RegExp(source + dollarSign)
}

// Wrap the `source` of an expression-like string so that it matches only at
// the start of a value.
function start(source) {
  return new RegExp(caret + source)
}
