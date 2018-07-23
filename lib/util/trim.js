'use strict'

var re = /^\s*|\s*$/g

module.exports = trim

function trim(value) {
  return value.replace(re, '')
}
