'use strict'

var push = require('./util/add.js')

module.exports = add

// Add `value` to the checker.
function add(value, model) {
  var self = this
  var dict = self.data
  var codes = dict[model]

  push(dict, value, codes, self)

  return self
}
