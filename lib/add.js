'use strict';

var has = require('has');

module.exports = add;

/* Add `value` to the checker. */
function add(value, model) {
  var self = this;
  var dict = self.data;

  dict[value] = [];

  if (model && has(dict, model) && dict[model]) {
    dict[value] = dict[model].concat();
  }

  return self;
}
