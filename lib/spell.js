'use strict';

var form = require('./util/form.js');
var flag = require('./util/flag.js');

module.exports = spell;

/* Check spelling of `word`. */
function spell(word) {
  var self = this;
  var dict = self.data;
  var flags = self.flags;
  var value = form(self, word, true);

  /* Hunspell also provides `root` (root word of the input word),
   * and `compound` (whether `word` was compound). */
  return {
    correct: self.correct(word),
    forbidden: Boolean(value && flag(flags, 'FORBIDDENWORD', dict[value])),
    warn: Boolean(value && flag(flags, 'WARN', dict[value]))
  };
}
