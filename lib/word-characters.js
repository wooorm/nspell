/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:word-characters
 * @fileoverview Get the word characters defined in affix.
 */

'use strict';

/* Expose. */
module.exports = wordCharacters;

/**
 * Get the word characters defined in affix.
 *
 * @this {NSpell} - Context object.
 * @return {string?} - Value of `WORDCHARS` in affix file,
 *   when defined, or `null`.
 */
function wordCharacters() {
  return this.flags.WORDCHARS || null;
}
