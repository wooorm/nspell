'use strict'

var casing = require('./util/casing.js')
var normalize = require('./util/normalize.js')
var flag = require('./util/flag.js')
var form = require('./util/form.js')

module.exports = suggest

var push = [].push

var noSuggestType = 'NOSUGGEST'

// Suggest spelling for `value`.
// eslint-disable-next-line complexity
function suggest(value) {
  var self = this
  var replacementTable = self.replacementTable
  var conversion = self.conversion
  var groups = self.flags.KEY
  var suggestions = []
  var weighted = {}
  var memory
  var replacement
  var edits = []
  var values
  var index
  var length
  var offset
  var position
  var count
  var otherOffset
  var otherCount
  var otherCharacter
  var character
  var group
  var before
  var after
  var upper
  var insensitive
  var firstLevel
  var previous
  var next
  var nextCharacter
  var max
  var distance
  var size
  var normalized
  var suggestion
  var currentCase

  value = normalize(value.trim(), conversion.in)

  if (!value || self.correct(value)) {
    return []
  }

  currentCase = casing(value)

  // Check the replacement table.
  length = replacementTable.length
  index = -1

  while (++index < length) {
    replacement = replacementTable[index]
    offset = value.indexOf(replacement[0])

    while (offset !== -1) {
      edits.push(value.replace(replacement[0], replacement[1]))
      offset = value.indexOf(replacement[0], offset + 1)
    }
  }

  // Check the keyboard.
  length = value.length
  index = -1

  while (++index < length) {
    character = value.charAt(index)
    insensitive = character.toLowerCase()
    upper = insensitive !== character
    offset = -1
    count = groups.length

    while (++offset < count) {
      group = groups[offset]
      position = group.indexOf(insensitive)

      if (position === -1) {
        continue
      }

      before = value.slice(0, position)
      after = value.slice(position + 1)
      otherOffset = -1
      otherCount = group.length

      while (++otherOffset < otherCount) {
        if (otherOffset !== position) {
          otherCharacter = group.charAt(otherOffset)

          if (upper) {
            otherCharacter = otherCharacter.toUpperCase()
          }

          edits.push(before + otherCharacter + after)
        }
      }
    }
  }

  // Check cases where one of a double character was forgotten, or one too many
  // were added, up to three “distances”.  This increases the success-rate by 2%
  // and speeds the process up by 13%.
  length = value.length
  index = -1
  nextCharacter = value.charAt(0)
  values = ['']
  max = 1
  distance = 0

  while (++index < length) {
    character = nextCharacter
    nextCharacter = value.charAt(index + 1)
    before = value.slice(0, index)

    replacement = character === nextCharacter ? '' : character + character
    offset = -1
    count = values.length

    while (++offset < count) {
      if (offset <= max) {
        values.push(values[offset] + replacement)
      }

      values[offset] += character
    }

    if (++distance < 3) {
      max = values.length
    }
  }

  push.apply(edits, values)

  // Ensure the capitalised and uppercase values are included.
  values = [value]
  replacement = value.toLowerCase()

  if (value === replacement) {
    values.push(value.charAt(0).toUpperCase() + replacement.slice(1))
  }

  replacement = value.toUpperCase()

  if (value !== replacement) {
    values.push(replacement)
  }

  // Construct a memory object for `generate`.
  memory = {
    state: {},
    weighted: weighted,
    suggestions: suggestions
  }

  firstLevel = generate(self, memory, values, edits)

  // While there are no suggestions based on generated values with an
  // edit-distance of `1`, check the generated values, `SIZE` at a time.
  // Basically, we’re generating values with an edit-distance of `2`, but were
  // doing it in small batches because it’s such an expensive operation.
  previous = 0
  max = Math.pow(Math.max(15 - value.length, 3), 3)
  max = Math.min(firstLevel.length, max)
  size = Math.max(Math.pow(10 - value.length, 3), 1)

  while (!suggestions.length && previous < max) {
    next = previous + size
    generate(self, memory, firstLevel.slice(previous, next))
    previous = next
  }

  // Sort the suggestions based on their weight.
  suggestions.sort(sort)

  // Normalize the output.
  values = []
  normalized = []
  index = -1
  length = suggestions.length

  while (++index < length) {
    suggestion = normalize(suggestions[index], conversion.out)
    suggestions[index] = suggestion
    replacement = suggestion.toLowerCase()

    if (normalized.indexOf(replacement) === -1) {
      values.push(suggestion)
      normalized.push(replacement)
    }
  }

  // BOOM! All done!
  return values

  function sort(a, b) {
    return sortWeight(a, b) || sortCasing(a, b) || sortAlpha(a, b)
  }

  function sortWeight(a, b) {
    if (weighted[a] === weighted[b]) {
      return 0
    }

    return weighted[a] > weighted[b] ? -1 : 1
  }

  function sortCasing(a, b) {
    var leftCasing = casing(a)
    var rightCasing = casing(b)

    if (leftCasing !== rightCasing) {
      if (leftCasing === currentCase) {
        return -1
      }

      if (rightCasing === currentCase) {
        return 1
      }
    }

    return 0
  }

  function sortAlpha(a, b) {
    return a.localeCompare(b)
  }
}

// Get a list of values close in edit distance to `words`.
function generate(context, memory, words, edits) {
  var characters = context.flags.TRY
  var characterLength = characters.length
  var data = context.data
  var flags = context.flags
  var result = []
  var upper
  var nextUpper
  var length
  var index
  var word
  var position
  var count
  var before
  var after
  var nextAfter
  var nextNextAfter
  var character
  var nextCharacter
  var inject
  var offset
  var currentCase

  // Check the pre-generated edits.
  length = edits && edits.length
  index = -1

  while (++index < length) {
    check(edits[index], true)
  }

  // Iterate over given word.
  length = words.length
  index = -1

  while (++index < length) {
    word = words[index]

    before = ''
    character = ''
    nextAfter = word
    currentCase = casing(word)
    nextNextAfter = word.slice(1)
    nextCharacter = word.charAt(0)
    nextUpper = nextCharacter.toLowerCase() !== nextCharacter
    position = -1
    count = word.length + 1

    // Iterate over every character (including the end).
    while (++position < count) {
      before += character
      after = nextAfter
      nextAfter = nextNextAfter
      nextNextAfter = nextAfter.slice(1)
      character = nextCharacter
      nextCharacter = word.charAt(position + 1)
      upper = nextUpper
      if (nextCharacter) {
        nextUpper = nextCharacter.toLowerCase() !== nextCharacter
      }

      if (nextAfter && upper !== nextUpper) {
        // Remove.
        check(before + switchCase(nextAfter))

        // Switch.
        check(
          before +
            switchCase(nextCharacter) +
            switchCase(character) +
            nextNextAfter
        )
      }

      // Remove.
      check(before + nextAfter)

      // Switch.
      if (nextAfter) {
        check(before + nextCharacter + character + nextNextAfter)
      }

      // Iterate over all possible letters.
      offset = -1

      while (++offset < characterLength) {
        inject = characters[offset]

        // Try upper-case if the original character was upper-cased.
        if (upper && inject !== inject.toUpperCase()) {
          if (currentCase !== 's') {
            check(before + inject + after)
            check(before + inject + nextAfter)
          }

          inject = inject.toUpperCase()

          check(before + inject + after)
          check(before + inject + nextAfter)
        } else {
          // Add and replace.
          check(before + inject + after)
          check(before + inject + nextAfter)
        }
      }
    }
  }

  // Return the list of generated words.
  return result

  // Check and handle a generated value.
  function check(value, double) {
    var state = memory.state[value]
    var corrected

    if (state !== Boolean(state)) {
      result.push(value)

      corrected = form(context, value)
      state = corrected && !flag(flags, noSuggestType, data[corrected])

      memory.state[value] = state

      if (state) {
        memory.weighted[value] = double ? 10 : 0
        memory.suggestions.push(value)
      }
    }

    if (state) {
      memory.weighted[value]++
    }
  }

  function switchCase(fragment) {
    var first = fragment.charAt(0)
    if (first.toLowerCase() === first) {
      return first.toUpperCase() + fragment.slice(1)
    }

    return first.toLowerCase() + fragment.slice(1)
  }
}
