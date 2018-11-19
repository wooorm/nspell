'use strict'

var trim = require('./util/trim.js')

module.exports = add

// Add a dictionary.
function add(buf) {
  var self = this
  var flags = self.flags
  var lines = buf.toString('utf8').split('\n')
  var length = lines.length
  var index = -1
  var line
  var forbidden
  var word
  var model
  var flag

  // Ensure there’s a key for `FORBIDDENWORD`: `false` cannot be set through an
  // affix file so its safe to use as a magic constant.
  flag = flags.FORBIDDENWORD || false
  flags.FORBIDDENWORD = flag

  while (++index < length) {
    line = trim(lines[index])

    if (!line) {
      continue
    }

    line = line.split('/')
    word = line[0]
    model = line[1]
    forbidden = word.charAt(0) === '*'

    if (forbidden) {
      word = word.slice(1)
    }

    self.add(word, model)

    if (forbidden) {
      self.data[word].push(flag)
    }
  }

  return self
}
