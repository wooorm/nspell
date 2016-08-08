/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:util:casing
 * @fileoverview Apply a rule.
 */

'use strict';

/* Expose. */
module.exports = casing;

/**
 * Get the casing of `value`.
 *
 * @private
 * @param {string} value - Word to check.
 * @return {stirng} - Casing.
 */
function casing(value) {
  var head = exact(value.charAt(0));
  var rest = value.slice(1);

  if (!rest) {
    return head;
  }

  rest = exact(rest);

  if (head === rest) {
    return head;
  }

  if (head === 'u' && rest === 'l') {
    return 's';
  }

  return null;
}

function exact(value) {
  if (value.toLowerCase() === value) {
    return 'l';
  }

  return value.toUpperCase() === value ? 'u' : null;
}
