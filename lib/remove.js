'use strict'

module.exports = remove

// Remove `value` from the checker.
function remove(value) {
  var self = this

  self.data.delete(value)

  return self
}
