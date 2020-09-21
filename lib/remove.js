'use strict'

module.exports = remove

// Remove `value` from the checker.
function remove(value) {
  var self = this

  delete self.data[value]

  return self
}
