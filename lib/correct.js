'use strict'

var form = require('./util/form.js')

module.exports = correct

// Check spelling of `value`.
function correct(value) {
  return Boolean(form(this, value))
}
