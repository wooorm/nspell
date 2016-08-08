/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:util:normalize
 * @fileoverview Normalize `value` with patterns.
 */

'use strict';

/* Expose. */
module.exports = normalize;

/**
 * Normalize `value` with patterns.
 *
 * @private
 * @param {string} value - Value to normalize.
 * @param {Array} patterns - Rules to normalize by.
 * @return {string} - Normalized value.
 */
function normalize(value, patterns) {
  var length = patterns.length;
  var index = -1;
  var pattern;

  while (++index < length) {
    pattern = patterns[index];
    value = value.replace(pattern[0], pattern[1]);
  }

  return value;
}
