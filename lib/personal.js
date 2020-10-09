'use strict'

module.exports = add

var NO_CODES = []

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
    line = lines[index].trim()

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

    self.add(word, model, NO_CODES)

    if (forbidden) {
      self.data.get(word).push(flag)
    }
  }

  return self
}
