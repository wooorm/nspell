'use strict'

module.exports = add

var own = {}.hasOwnProperty

/* Add `value` to the checker. */
function add(value, model) {
  var self = this
  var dict = self.data

  dict[value] = []

  if (model && own.call(dict, model) && dict[model]) {
    dict[value] = dict[model].concat()
  }

  return self
}
