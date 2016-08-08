/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell
 * @fileoverview Hunspell-compatible spell-checker.
 */

'use strict';

/* Dependencies. */
var affix = require('./util/affix.js');

/* Expose. */
module.exports = NSpell;

var proto = NSpell.prototype;

proto.correct = require('./correct.js');
proto.suggest = require('./suggest.js');
proto.spell = require('./spell.js');
proto.add = require('./add.js');
proto.remove = require('./remove.js');
proto.wordCharacters = require('./word-characters.js');
proto.dictionary = require('./dictionary.js');
proto.personal = require('./personal.js');

/**
 * Construct a new spelling context.
 *
 * @constructor
 * @class {NSpell} - Spelling context.
 * @param {Object|Buffer|string} aff - Buffer of affix-file, or
 *   dictionary object with `aff` and `dic` properties set
 *   to buffers.
 * @param {Buffer?} [dic] - Buffer of dictionary-file.
 */
function NSpell(aff, dic) {
  if (!(this instanceof NSpell)) {
    return new NSpell(aff, dic);
  }

  /* Support dictionary objects, see:
   * https://github.com/wooorm/dictionaries. */
  if (!dic && aff && aff.aff && aff.dic) {
    dic = aff.dic;
    aff = aff.aff;
  }

  if (!aff) {
    throw new Error('Missing `aff` in dictionary');
  }

  if (!dic) {
    throw new Error('Missing `dic` in dictionary');
  }

  aff = affix(aff);

  this.data = {};
  this.compoundRuleCodes = aff.compoundRuleCodes;
  this.replacementTable = aff.replacementTable;
  this.conversion = aff.conversion;
  this.compoundRules = aff.compoundRules;
  this.rules = aff.rules;
  this.flags = aff.flags;

  this.dictionary(dic);
}
