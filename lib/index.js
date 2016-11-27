'use strict';

var affix = require('./util/affix.js');

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

/* Construct a new spelling context. */
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
