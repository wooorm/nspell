'use strict'

var apply = require('./apply.js')

module.exports = add

var own = {}.hasOwnProperty

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
  var suboffset
  var wordCount
  var newWordCount

  /* Compound words. */
  if (!own.call(flags, 'NEEDAFFIX') || codes.indexOf(flags.NEEDAFFIX) === -1) {
    add(word, codes)
  }

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

        add(newWord)

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
            add(otherNewWords[suboffset])
          }
        }
      }
    }
  }

  /* Add `rules` for `word` to the table. */
  function add(word, rules) {
    /* Some dictionaries will list the same word multiple times
     * with different rule sets. */
    var curr = (own.call(dict, word) && dict[word]) || []
    dict[word] = curr.concat(rules || [])
  }
}
