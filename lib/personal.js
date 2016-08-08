/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module nspell:personal
 * @fileoverview Add a personal dictionary.
 */

'use strict';

/* Dependencies. */
var trim = require('trim');

/* Expose. */
module.exports = add;

/**
 * Add a dictionary.
 *
 * @this {NSpell} - Context object.
 * @param {Buffer|string} buf - Buffer of personal
 *   dictionary.
 * @return {NSpell} - Context object.
 */
function add(buf) {
  var self = this;
  var flags = self.flags;
  var lines = buf.toString('utf8').split('\n');
  var length = lines.length;
  var index = -1;
  var line;
  var forbidden;
  var word;
  var model;
  var flag;

  /* Ensure there’s a key for `FORBIDDENWORD`: `false`
   * cannot be set through an affix file so its safe to use
   * as a magic constant. */
  flag = flags.FORBIDDENWORD = flags.FORBIDDENWORD || false;

  while (++index < length) {
    line = trim(lines[index]);

    if (!line) {
      continue;
    }

    line = line.split('/');
    word = line[0];
    model = line[1];
    forbidden = word.charAt(0) === '*';

    if (forbidden) {
      word = word.slice(1);
    }

    self.add(word, model);

    if (forbidden) {
      self.data[word].push(flag);
    }
  }

  return self;
}
