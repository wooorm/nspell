/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:util:exact
 * @fileoverview Check spelling of `value`, exactly.
 */

'use strict';

/* Dependencies. */
var has = require('has');
var flag = require('./flag.js');

/* Expose. */
module.exports = exact;

/**
 * Check spelling of `value`, exactly.
 *
 * @param {Object} context - Context object.
 * @param {string} value - Word to check.
 * @return {boolean} - Whether `value` is correcly spelled,
 *   without normalising its casing.
 */
function exact(context, value) {
  var data = context.data;
  var flags = context.flags;
  var codes = has(data, value) ? data[value] : null;
  var compound;
  var index;
  var length;

  if (codes) {
    return !flag(flags, 'ONLYINCOMPOUND', codes);
  }

  compound = context.compoundRules;
  length = compound.length;
  index = -1;

  /* Check if this might be a compound word. */
  if (value.length >= flags.COMPOUNDMIN) {
    while (++index < length) {
      if (value.match(compound[index])) {
        return true;
      }
    }
  }

  return false;
}
