/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:util:rule-codes
 * @fileoverview Parse rule codes.
 */

'use strict';

/* Expose. */
module.exports = ruleCodes;

/**
 * Parse rule codes.
 *
 * @private
 * @param {Object} flags - Current flags.
 * @param {string} value - Codes to parse.
 * @return {Array.<string>} - Parsed codes.
 */
function ruleCodes(flags, value) {
  var flag = flags.FLAG;
  var result = [];
  var length;
  var index;

  if (!value) {
    return result;
  }

  if (flag === 'long') {
    index = 0;
    length = value.length;

    while (index < length) {
      result.push(value.substr(index, 2));

      index += 2;
    }

    return result;
  }

  return value.split(flag === 'num' ? ',' : '');
}
