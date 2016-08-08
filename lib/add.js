/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:add
 * @fileoverview Add `value` to the checker.
 */

'use strict';

/* Dependencies. */
var has = require('has');

/* Expose. */
module.exports = add;

/**
 * Add `value` to the checker.
 *
 * @this {NSpell} - Context object.
 * @param {string} value - Word to add.
 * @param {string?} [model] - Word to model.
 * @return {NSpell} - Context object.
 */
function add(value, model) {
  var self = this;
  var dict = self.data;

  dict[value] = [];

  if (model && has(dict, model) && dict[model]) {
    dict[value] = dict[model].concat();
  }

  return self;
}
