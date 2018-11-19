'use strict'

module.exports = wordCharacters

// Get the word characters defined in affix.
function wordCharacters() {
  return this.flags.WORDCHARS || null
}
