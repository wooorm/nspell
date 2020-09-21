'use strict'

var apply = require('./apply.js')

module.exports = add

var own = {}.hasOwnProperty
var push = [].push

var NO_RULES = []

// Add `rules` for `word` to the table.
function addRules(dict, word, rules) {
  // Some dictionaries will list the same word multiple times with different
  // rule sets.
  if (word in dict) {
    var curr = dict[word]
    if (curr === NO_RULES) {
      dict[word] = rules.concat()
    } else {
      push.apply(curr, rules)
    }
  } else {
    dict[word] = rules.concat()
  }
}

function add(dict, word, codes, options) {
  var flags = options.flags
  var rules = options.rules
  var compoundRuleCodes = options.compoundRuleCodes
  var position
  var length
  var code
  var rule
  var newWords
  var offset
  var newWord
  var subposition
  var combined
  var otherNewWords
  var otherNewWord
  var suboffset
  var wordCount
  var newWordCount

  // Compound words.
  if (!own.call(flags, 'NEEDAFFIX') || codes.indexOf(flags.NEEDAFFIX) === -1) {
    addRules(dict, word, codes)
  }

  if (!codes) return

  position = -1
  length = codes.length

  while (++position < length) {
    code = codes[position]
    rule = rules[code]

    if (code in compoundRuleCodes) {
      compoundRuleCodes[code].push(word)
    }

    if (rule) {
      newWords = apply(word, rule, rules)
      wordCount = newWords.length
      offset = -1

      while (++offset < wordCount) {
        newWord = newWords[offset]

        if (!(newWord in dict)) dict[newWord] = NO_RULES

        if (!rule.combineable) {
          continue
        }

        subposition = position

        while (++subposition < length) {
          combined = rules[codes[subposition]]

          if (
            !combined ||
            !combined.combineable ||
            rule.type === combined.type
          ) {
            continue
          }

          otherNewWords = apply(newWord, combined, rules)
          newWordCount = otherNewWords.length
          suboffset = -1

          while (++suboffset < newWordCount) {
            otherNewWord = otherNewWords[suboffset]
            if (!(otherNewWord in dict)) dict[otherNewWord] = NO_RULES
          }
        }
      }
    }
  }
}
