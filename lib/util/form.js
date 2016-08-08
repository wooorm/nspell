/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:util:form
 * @fileoverview Get the correct, if spelled OK, casing
 *   of a word.
 */

'use strict';

/* Dependencies. */
var trim = require('trim');
var exact = require('./exact.js');
var flag = require('./flag.js');

/* Expose. */
module.exports = form;

/**
 * Find a known form of `value`.
 *
 * @param {Object} context - Context object.
 * @param {string} value - Word to check.
 * @return {boolean?} [all=false] - Include forbidden words.
 * @return {string?} - Corrected form.
 */
function form(context, value, all) {
  var dict = context.data;
  var flags = context.flags;
  var alternative;

  value = trim(value);

  if (!value) {
    return null;
  }

  if (exact(context, value)) {
    if (!all && flag(flags, 'FORBIDDENWORD', dict[value])) {
      return null;
    }

    return value;
  }

  /* Try sentence-case if the value is upper-case. */
  if (value.toUpperCase() === value) {
    alternative = value.charAt(0) + value.slice(1).toLowerCase();

    if (ignore(flags, dict[alternative], all)) {
      return null;
    }

    if (exact(context, alternative)) {
      return alternative;
    }
  }

  /* Try lower-case. */
  alternative = value.toLowerCase();

  if (alternative !== value) {
    if (ignore(flags, dict[alternative], all)) {
      return null;
    }

    if (exact(context, alternative)) {
      return alternative;
    }
  }

  return null;
}

function ignore(flags, dict, all) {
  return flag(flags, 'KEEPCASE', dict) ||
    all ||
    flag(flags, 'FORBIDDENWORD', dict);
}
