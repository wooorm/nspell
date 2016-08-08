/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:remove
 * @fileoverview Remove `value` from the checker.
 */

'use strict';

/* Expose. */
module.exports = remove;

/**
 * Remove `value` from the checker.
 *
 * @this {NSpell} - Context object.
 * @param {string} value - Word to remove.
 * @return {NSpell} - Context object.
 */
function remove(value) {
  var self = this;

  self.data[value] = null;

  return self;
}
