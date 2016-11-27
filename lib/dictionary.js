/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:dictionary
 * @fileoverview Add a dictionary file.
 */

'use strict';

/* Dependencies. */
var parse = require('./util/dictionary.js');

/* Expose. */
module.exports = add;

/**
 * Add a dictionary file.
 *
 * @this {NSpell} - Context object.
 * @param {Buffer|string} buf - Buffer of dictionary-file.
 * @return {NSpell} - Context object.
 */
function add(buf) {
  var self = this;
  var compound = self.compoundRules;
  var compoundCodes = self.compoundRuleCodes;
  var index = -1;
  var length = compound.length;
  var rule;
  var source;
  var character;
  var offset;
  var count;

  parse(buf, self, self.data);

  /* Regenerate compound expressions. */
  while (++index < length) {
    rule = compound[index];
    source = '';

    offset = -1;
    count = rule.length;

    while (++offset < count) {
      character = rule.charAt(offset);

      if (compoundCodes[character].length === 0) {
        source += character;
      } else {
        source += '(' + compoundCodes[character].join('|') + ')';
      }
    }

    compound[index] = new RegExp(source, 'i');
  }

  return self;
}
