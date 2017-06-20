'use strict';

var parseCodes = require('./rule-codes.js');
var apply = require('./apply.js');

module.exports = parse;

var own = {}.hasOwnProperty;

/* Constants. */
var UTF8 = 'utf8';
var C_LINE = '\n';
var C_SLASH = '/';
var CC_TAB = '\t'.charCodeAt(0);

/* Parse a dictionary. */
function parse(buf, options, dict) {
  var flags = options.flags;
  var rules = options.rules;
  var compoundRuleCodes = options.compoundRuleCodes;
  var index;
  var line;
  var word;
  var codes;
  var position;
  var length;
  var code;
  var rule;
  var newWords;
  var offset;
  var newWord;
  var subposition;
  var combined;
  var otherNewWords;
  var suboffset;
  var last;
  var wordCount;
  var newWordCount;
  var value;

  /* Parse as lines. */
  value = buf.toString(UTF8);
  last = value.indexOf(C_LINE) + 1;
  index = value.indexOf(C_LINE, last);

  while (index !== -1) {
    if (value.charCodeAt(last) !== CC_TAB) {
      line = value.slice(last, index);
      offset = line.indexOf(C_SLASH);

      if (offset === -1) {
        word = line;
        codes = [];
      } else {
        word = line.slice(0, offset);
        codes = parseCodes(flags, line.slice(offset + 1));
      }

      /* Compound words. */
      if (!own.call(flags, 'NEEDAFFIX') || codes.indexOf(flags.NEEDAFFIX) === -1) {
        add(word, codes);
      }

      position = -1;
      length = codes.length;

      while (++position < length) {
        code = codes[position];
        rule = rules[code];

        if (code in compoundRuleCodes) {
          compoundRuleCodes[code].push(word);
        }

        if (rule) {
          newWords = apply(word, rule, rules);
          wordCount = newWords.length;
          offset = -1;

          while (++offset < wordCount) {
            newWord = newWords[offset];

            add(newWord);

            if (!rule.combineable) {
              continue;
            }

            subposition = position;

            while (++subposition < length) {
              combined = rules[codes[subposition]];

              if (
                !combined ||
                !combined.combineable ||
                rule.type === combined.type
              ) {
                continue;
              }

              otherNewWords = apply(newWord, combined, rules);
              newWordCount = otherNewWords.length;
              suboffset = -1;

              while (++suboffset < newWordCount) {
                add(otherNewWords[suboffset]);
              }
            }
          }
        }
      }
    }

    last = index + 1;
    index = value.indexOf(C_LINE, last);
  }

  /* Add `rules` for `word` to the table. */
  function add(word, rules) {
    /* Some dictionaries will list the same word multiple times
     * with different rule sets. */
    dict[word] = ((own.call(dict, word) && dict[word]) || []).concat(rules || []);
  }
}
