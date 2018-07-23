var bail = require('bail')
var timer = require('time-span')
var dict = require('dictionary-en-us')
var levenshtein = require('levenshtein-edit-distance')
var misspellings = require('./misspellings')
var nspell = require('..')

var distances = {}
var all = []
var diff
var percentage
var message
var totalTime = 0

dict(function(err, dictionary) {
  var spell

  bail(err)

  spell = nspell(dictionary)

  misspellings.forEach(function(misspelling) {
    var value = misspelling.value
    var end = timer()
    var result = spell.suggest(value)
    var time = end()

    totalTime += time

    misspelling.suggestions.forEach(function(suggestion) {
      all.push({
        input: value,
        output: suggestion,
        correct: result.indexOf(suggestion) !== -1,
        time: time,
        res: result
      })
    })
  })
})

process.on('exit', function() {
  var count = all.length
  var types = {true: [], false: []}
  var time = {}
  var failures
  var successes

  all.forEach(function(fixture) {
    var av = Math.ceil(fixture.time / 50) * 50

    if (!time[av]) {
      time[av] = {true: 0, false: 0}
    }

    time[av][fixture.correct]++

    fixture.distance = levenshtein(fixture.input, fixture.output)
    types[fixture.correct].push(fixture)
  })

  failures = types.false.length
  successes = types.true.length

  diff = totalTime / misspellings.length
  percentage = ((failures / count) * 100).toFixed(2)
  message = [
    'success: ' + (100 - percentage) + '% (' + successes + ')',
    'fail: ' + percentage + '% (' + failures + ')',
    'total: ' + count
  ]

  /* eslint-disable no-console */
  console.log()
  console.log('average time: ' + diff + 'ms')
  console.log(message.join(', '))
  console.log('differences: ', distances)
  console.log()
  console.log(types.false)
  console.log(time)
})
