/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:spell
 * @fileoverview Check spelling of `word`.
 */

'use strict';

/* Dependencies. */
var form = require('./util/form.js');
var flag = require('./util/flag.js');

/* Expose. */
module.exports = spell;

/**
 * Spell-check result.
 *
 * @typedef {Object} Check
 * @property {boolean} correct - Whether `word` was spelled correctly.
 * @property {string} root - Root word of the input word.
 * @property {boolean} compount - Whether `word` was compound.
 * @property {boolean} forbidden - Whether `word` is forbidden.
 * @property {boolean} warn - Whether `word` is a warning.
 */

/**
 * Check spelling of `word`.
 *
 * @this {NSpell} - Context object.
 * @param {string} word - Word to check.
 * @return {Check} - Spelling result.
 */
function spell(word) {
  var self = this;
  var dict = self.data;
  var flags = self.flags;
  var value = form(self, word, true);

  return {
    correct: self.correct(word),
    forbidden: Boolean(value && flag(flags, 'FORBIDDENWORD', dict[value])),
    warn: Boolean(value && flag(flags, 'WARN', dict[value]))
  };
}
