'use strict'

module.exports = apply

// Apply a rule.
function apply(value, rule, rules, words) {
  var index = -1
  var entry
  var next
  var continuationRule
  var continuation
  var position

  while (++index < rule.entries.length) {
    entry = rule.entries[index]
    continuation = entry.continuation
    position = -1

    if (!entry.match || entry.match.test(value)) {
      next = entry.remove ? value.replace(entry.remove, '') : value
      next = rule.type === 'SFX' ? next + entry.add : entry.add + next
      words.push(next)

      if (continuation && continuation.length) {
        while (++position < continuation.length) {
          continuationRule = rules[continuation[position]]

          if (continuationRule) {
            apply(next, continuationRule, rules, words)
          }
        }
      }
    }
  }

  return words
}
