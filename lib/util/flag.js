/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:util:flag
 * @fileoverview Check whether a word has a flag.
 */

'use strict';

/* Dependencies. */
var has = require('has');

/* Expose. */
module.exports = flag;

/**
 * Check whether a word has a flag.
 *
 * @param {Object} values - Hash of flags.
 * @param {string} value - Flag to check.
 * @param {?} flags - TODO
 * @return {boolean} - Whether a word has a flag.
 */
function flag(values, value, flags) {
  return flags &&
    has(values, value) &&
    flags.indexOf(values[value]) !== -1;
}
