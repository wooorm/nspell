'use strict'

module.exports = apply

var NO_WORDS = []

// Apply a rule.
function apply(value, rule, rules) {
  var entries = rule.entries
  var words = NO_WORDS
  var index = -1
  var length = entries.length
  var entry
  var next
  var continuationRule
  var continuation
  var position
  var count

  while (++index < length) {
    entry = entries[index]

    if (!entry.match || entry.match.test(value)) {
      next = value

      if (entry.remove) {
        next = next.replace(entry.remove, '')
      }

      if (rule.type === 'SFX') {
        next += entry.add
      } else {
        next = entry.add + next
      }

      if (words === NO_WORDS) {
        words = [next]
      } else {
        words.push(next)
      }

      continuation = entry.continuation

      if (continuation && continuation.length !== 0) {
        position = -1
        count = continuation.length

        while (++position < count) {
          continuationRule = rules[continuation[position]]

          if (continuationRule) {
            words.push.apply(words, apply(next, continuationRule, rules))
          }
        }
      }
    }
  }

  return words
}
