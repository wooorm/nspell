'use strict'

var normalize = require('./normalize.js')
var trim = require('./trim.js')
var exact = require('./exact.js')
var flag = require('./flag.js')

module.exports = form

// Find a known form of `value`.
function form(context, value, all) {
  var dict = context.data
  var flags = context.flags
  var alternative

  value = trim(value)

  if (!value) {
    return null
  }

  value = normalize(value, context.conversion.in)

  if (exact(context, value)) {
    if (!all && flag(flags, 'FORBIDDENWORD', dict[value])) {
      return null
    }

    return value
  }

  // Try sentence-case if the value is upper-case.
  if (value.toUpperCase() === value) {
    alternative = value.charAt(0) + value.slice(1).toLowerCase()

    if (ignore(flags, dict[alternative], all)) {
      return null
    }

    if (exact(context, alternative)) {
      return alternative
    }
  }

  // Try lower-case.
  alternative = value.toLowerCase()

  if (alternative !== value) {
    if (ignore(flags, dict[alternative], all)) {
      return null
    }

    if (exact(context, alternative)) {
      return alternative
    }
  }

  return null
}

function ignore(flags, dict, all) {
  return (
    flag(flags, 'KEEPCASE', dict) || all || flag(flags, 'FORBIDDENWORD', dict)
  )
}
