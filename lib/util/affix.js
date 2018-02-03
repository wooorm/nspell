'use strict';

var trim = require('trim');
var parse = require('./rule-codes.js');

module.exports = affix;

/* Rule types. */
var T_ONLYINCOMPOUND = 'ONLYINCOMPOUND';
var T_COMPOUNDRULE = 'COMPOUNDRULE';
var T_COMPOUNDMIN = 'COMPOUNDMIN';
var T_WORDCHARS = 'WORDCHARS';
var T_KEEPCASE = 'KEEPCASE';
var T_NOSUGGEST = 'NOSUGGEST';
var T_ICONV = 'ICONV';
var T_OCONV = 'OCONV';
var T_FLAG = 'FLAG';
var T_PFX = 'PFX';
var T_SFX = 'SFX';
var T_REP = 'REP';
var T_TRY = 'TRY';
var T_KEY = 'KEY';

/* Constants. */
var COMBINEABLE = 'Y';
var UTF8 = 'utf8';

/* Relative frequencies of letters in the English language. */
var ALPHABET = 'etaoinshrdlcumwfgypbvkjxqz'.split('');

/* Expressions. */
var RE_WHITE_SPACE = /\s/;
var RE_INLINE_WHITE_SPACE = / +/;

/* Characters. */
var C_LINE = '\n';
var C_HASH = '#';
var C_DOLLAR = '$';
var C_CARET = '^';
var C_SLASH = '/';
var C_DOT = '.';
var C_0 = '0';

/* Defaults. */
var DEFAULT_COMPOUNDMIN = 3;

var DEFAULT_KEY = [
  'qwertzuop',
  'yxcvbnm',
  'qaw',
  'say',
  'wse',
  'dsx',
  'sy',
  'edr',
  'fdc',
  'dx',
  'rft',
  'gfv',
  'fc',
  'tgz',
  'hgb',
  'gv',
  'zhu',
  'jhn',
  'hb',
  'uji',
  'kjm',
  'jn',
  'iko',
  'lkm'
];

/* Parse an affix file. */
function affix(aff) {
  var rules = {};
  var replacementTable = [];
  var conversion = {in: [], out: []};
  var compoundRuleCodes = {};
  var lines = [];
  var flags = {};
  var compoundRules = [];
  var index;
  var length;
  var parts;
  var line;
  var ruleType;
  var entries;
  var count;
  var remove;
  var add;
  var source;
  var entry;
  var ruleLength;
  var position;
  var rule;
  var last;
  var lineEnd;
  var hashIndex;
  var value;
  var offset;
  var character;

  flags[T_KEY] = [];

  /* Process the affix buffer into a list of applicable
   * lines. */
  aff = aff.toString(UTF8);
  index = aff.indexOf(C_LINE);
  hashIndex = aff.indexOf(C_HASH);
  last = 0;

  while (index !== -1) {
    if (hashIndex < last) {
      hashIndex = aff.indexOf(C_HASH, last);
    }

    lineEnd = hashIndex !== -1 && hashIndex < index ? hashIndex : index;
    line = trim(aff.slice(last, lineEnd));

    if (line) {
      lines.push(line);
    }

    last = index + 1;
    index = aff.indexOf(C_LINE, last);
  }

  /* Process each line. */
  index = -1;
  length = lines.length;

  while (++index < length) {
    line = lines[index];
    parts = line.split(RE_WHITE_SPACE);
    ruleType = parts[0];

    if (ruleType === T_REP) {
      count = index + parseInt(parts[1], 10);

      while (++index <= count) {
        parts = lines[index].split(RE_INLINE_WHITE_SPACE);
        replacementTable.push([parts[1], parts[2]]);
      }

      index = count;
    } else if (ruleType === T_ICONV || ruleType === T_OCONV) {
      entry = conversion[ruleType === T_ICONV ? 'in' : 'out'];
      count = index + parseInt(parts[1], 10);

      while (++index <= count) {
        parts = lines[index].split(RE_INLINE_WHITE_SPACE);

        entry.push([new RegExp(parts[1], 'g'), parts[2]]);
      }

      index = count;
    } else if (ruleType === T_COMPOUNDRULE) {
      count = index + parseInt(parts[1], 10);

      while (++index <= count) {
        rule = lines[index].split(RE_INLINE_WHITE_SPACE)[1];
        ruleLength = rule.length;
        position = -1;

        compoundRules.push(rule);

        while (++position < ruleLength) {
          compoundRuleCodes[rule.charAt(position)] = [];
        }
      }

      index = count;
    } else if (ruleType === T_PFX || ruleType === T_SFX) {
      count = index + parseInt(parts[3], 10);
      entries = [];

      rule = {
        type: ruleType,
        combineable: parts[2] === COMBINEABLE,
        entries: entries
      };

      rules[parts[1]] = rule;

      while (++index <= count) {
        parts = lines[index].split(RE_INLINE_WHITE_SPACE);
        remove = parts[2];
        add = parts[3].split(C_SLASH);
        source = parts[4];

        entry = {
          add: '',
          remove: '',
          match: '',
          continuation: parse(flags, add[1])
        };

        if (add && add[0] !== C_0) {
          entry.add = add[0];
        }

        try {
          if (remove !== C_0) {
            entry.remove = ruleType === T_SFX ? end(remove) : remove;
          }

          if (source && source !== C_DOT) {
            entry.match = (ruleType === T_SFX ? end : start)(source);
          }
        } catch (err) {
          /* Ignore invalid regex patterns. */
          entry = null;
        }

        if (entry) {
          entries.push(entry);
        }
      }

      index = count;
    } else if (ruleType === T_TRY) {
      source = parts[1];
      count = source.length;
      offset = -1;
      value = [];

      while (++offset < count) {
        character = source.charAt(offset);

        if (character.toLowerCase() === character) {
          value.push(character);
        }
      }

      /* Some dictionaries may forget a character.
       * Notably the enUS forgets the j`, `x`,
       * and `y`. */
      offset = -1;
      count = ALPHABET.length;

      while (++offset < count) {
        character = ALPHABET[offset];

        if (source.indexOf(character) === -1) {
          value.push(character);
        }
      }

      flags[ruleType] = value;
    } else if (ruleType === T_KEY) {
      flags[ruleType] = flags[ruleType].concat(parts[1].split('|'));
    } else if (ruleType === T_COMPOUNDMIN) {
      flags[ruleType] = Number(parts[1]);
    } else if (ruleType === T_ONLYINCOMPOUND) {
      /* If we add this ONLYINCOMPOUND flag to
       * `compoundRuleCodes`, then `parseDic` will do
       * the work of saving the list of words that
       * are compound-only. */
      flags[ruleType] = parts[1];
      compoundRuleCodes[parts[1]] = [];
    } else if (
      ruleType === T_KEEPCASE ||
      ruleType === T_WORDCHARS ||
      ruleType === T_FLAG ||
      ruleType === T_NOSUGGEST
    ) {
      flags[ruleType] = parts[1];
    } else {
      /* Default handling. Set them for now. */
      flags[ruleType] = parts[1];
    }
  }

  /* Default for `COMPOUNDMIN` is `3`.
   * See man 4 hunspell. */
  if (isNaN(flags[T_COMPOUNDMIN])) {
    flags[T_COMPOUNDMIN] = DEFAULT_COMPOUNDMIN;
  }

  if (flags[T_KEY].length === 0) {
    flags[T_KEY] = DEFAULT_KEY;
  }

  /* istanbul ignore if - Dictionaries seem to always have this. */
  if (!flags[T_TRY]) {
    flags[T_TRY] = ALPHABET.concat();
  }

  if (!flags[T_KEEPCASE]) {
    flags[T_KEEPCASE] = false;
  }

  return {
    compoundRuleCodes: compoundRuleCodes,
    replacementTable: replacementTable,
    conversion: conversion,
    compoundRules: compoundRules,
    rules: rules,
    flags: flags
  };
}

/* Wrap the `source` of an expression-like string so that
 * it matches only at the end of a value. */
function end(source) {
  return new RegExp(source + C_DOLLAR);
}

/* Wrap the `source` of an expression-like string so that
 * it matches only at the start of a value. */
function start(source) {
  return new RegExp(C_CARET + source);
}
