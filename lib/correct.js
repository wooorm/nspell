/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:correct
 * @fileoverview Check whether `value` is correctly spelled.
 */

'use strict';

/* Dependencies. */
var trim = require('trim');
var form = require('./util/form.js');

/* Expose. */
module.exports = correct;

/**
 * Check spelling of `value`.
 *
 * @this {NSpell} - Context object.
 * @param {string} value - Word to check.
 * @return {boolean} - whether `value` is correctly spelled.
 */
function correct(value) {
  return Boolean(form(this, trim(value)));
}
