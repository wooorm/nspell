'use strict'

var push = require('./util/add.js')

module.exports = add

var own = {}.hasOwnProperty

// Add `value` to the checker.
function add(value, model) {
  var self = this
  var dict = self.data
  var codes = model && own.call(dict, model) ? dict[model].concat() : []

  push(dict, value, codes, self)

  return self
}
