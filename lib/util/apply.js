/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:util:apply
 * @fileoverview Apply a rule.
 */

'use strict';

/* Expose. */
module.exports = apply;

/**
 * Apply a rule.
 *
 * @private
 * @param {string} value - Word to apply.
 * @param {Object} rule - Rule to apply on `value`.
 * @param {Object} rules - All rules.
 * @return {Array.<string>} - New words.
 */
function apply(value, rule, rules) {
  var entries = rule.entries;
  var words = [];
  var index = -1;
  var length = entries.length;
  var entry;
  var next;
  var continuationRule;
  var continuation;
  var position;
  var count;

  while (++index < length) {
    entry = entries[index];

    if (!entry.match || value.match(entry.match)) {
      next = value;

      if (entry.remove) {
        next = next.replace(entry.remove, '');
      }

      if (rule.type === 'SFX') {
        next += entry.add;
      } else {
        next = entry.add + next;
      }

      words.push(next);

      continuation = entry.continuation;

      if (continuation && continuation.length) {
        position = -1;
        count = continuation.length;

        while (++position < count) {
          continuationRule = rules[continuation[position]];

          if (continuationRule) {
            words = words.concat(
              apply(next, continuationRule, rules)
            );
          }
        }
      }
    }
  }

  return words;
}
