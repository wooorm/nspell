'use strict'

module.exports = remove

// Remove `value` from the checker.
function remove(value) {
  var self = this

  self.data[value] = null

  return self
}
