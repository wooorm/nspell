'use strict'

var push = require('./util/add.js')

module.exports = add

var NO_CODES = []

// Add `value` to the checker.
function add(value, model) {
  var self = this
  var dict = self.data
  var codes = dict.get(model) || NO_CODES

  push(dict, value, codes, self)

  return self
}
