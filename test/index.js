'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var nspell = require('..')

var EN_GB = 'en-gb'
var EN_US = 'en-us'
var DA = 'da'
var NL = 'nl'
var DE = 'de'
var ES = 'es'
var CS = 'cs'

var codes = [EN_GB, EN_US, DA, NL, DE, ES, CS]

var dictionaries = {}

codes.forEach(function(code) {
  dictionaries[code] = {
    aff: fs.readFileSync(
      path.join('node_modules', 'dictionary-' + code, 'index.aff')
    ),
    dic: fs.readFileSync(
      path.join('node_modules', 'dictionary-' + code, 'index.dic')
    )
  }
})

test('NSpell()', function(t) {
  var es = nspell(dictionaries[ES])
  var us
  var gb
  var nl
  var de
  var da

  t.equal(typeof nspell, 'function', 'should expose a function')

  t.throws(
    function() {
      nspell()
    },
    /Missing `aff` in dictionary/,
    'should warn when missing `aff` (1)'
  )

  t.throws(
    function() {
      nspell({})
    },
    /Missing `aff` in dictionary/,
    'should warn when missing `aff` (2)'
  )

  t.throws(
    function() {
      nspell([])
    },
    /Missing `aff` in dictionary/,
    'should warn when missing `aff` (3)'
  )

  de = nspell(dictionaries[DE].aff)

  t.equal(
    de instanceof nspell,
    true,
    'should construct a new instance from one buffer'
  )

  gb = nspell(dictionaries[EN_GB].aff, dictionaries[EN_GB].dic)

  t.equal(
    gb instanceof nspell,
    true,
    'should construct a new instance from two buffers'
  )

  us = nspell(dictionaries[EN_US])

  t.equal(
    us instanceof nspell,
    true,
    'should construct a new instance from a dictionary object'
  )

  nl = nspell([dictionaries[NL]])

  t.equal(
    nl instanceof nspell,
    true,
    'should construct a new instance from a list of dictionary objects'
  )

  de.dictionary(dictionaries[DE].dic)

  da = nspell([{aff: dictionaries[DA].aff}, {dic: dictionaries[DA].dic}])

  t.equal(
    da instanceof nspell,
    true,
    'should construct a new instance from a list of partial dictionary objects'
  )

  t.equal(typeof nl.data, 'object', 'should expose data')

  t.equal(typeof de.rules, 'object', 'should expose rules')

  t.equal(typeof da.flags, 'object', 'should expose flags')

  t.equal(Array.isArray(us.compoundRules), true, 'should expose compound rules')

  t.equal(
    typeof us.compoundRuleCodes,
    'object',
    'should expose compound rule codes'
  )

  t.equal(
    typeof us.replacementTable,
    'object',
    'should expose a replacement table'
  )

  t.test('nspell#wordCharacters()', function(st) {
    st.equal(
      us.wordCharacters(),
      '0123456789',
      'should return the defined word-characters'
    )

    st.equal(es.wordCharacters(), null, 'should return `null` when not defined')

    st.end()
  })

  t.test('nspell#correct(value)', function(st) {
    st.equal(
      us.correct('colour'),
      false,
      'should return `false` when a word is not correctly spelled'
    )

    st.equal(
      us.correct('color'),
      true,
      'should return `true` when a word is correctly spelled (1)'
    )

    st.equal(
      us.correct('c'),
      true,
      'should return `true` when a word is correctly spelled (2)'
    )

    st.equal(us.correct(' '), false, 'should return `false` without word')

    st.equal(us.correct('.'), false, 'should return `false` for non-words')

    st.equal(
      us.correct('ABDUL'),
      true,
      'should check for sentence-case when upper-case (ok)'
    )

    st.equal(
      us.correct('COLOUR'),
      false,
      'should check for sentence-case when upper-case (not ok)'
    )

    st.equal(us.correct('Color'), true, 'should check for lower-case (ok)')

    st.equal(
      us.correct('Colour'),
      false,
      'should check for lower-case (not ok)'
    )

    st.equal(
      us.correct('Colour'),
      false,
      'should check for lower-case (not ok)'
    )

    st.equal(
      nl.correct('DVD'),
      false,
      'should not check upper-case for sentence-case when KEEPCASE'
    )

    st.equal(
      nl.correct('dVd'),
      false,
      'should not check other casing for lower-case when KEEPCASE'
    )

    st.equal(
      nl.correct('eierlevendbarend'),
      true,
      'should support ONLYINCOMPOUND (ok)'
    )

    st.equal(
      nl.correct('eier'),
      false,
      'should support ONLYINCOMPOUND (not ok)'
    )

    st.equal(us.correct('21st'), true, 'should support compounds (1)')

    st.equal(us.correct('20st'), false, 'should support compounds (2)')

    st.equal(us.correct('20th'), true, 'should support compounds (3)')

    st.equal(us.correct('23st'), false, 'should support compounds (4)')

    st.equal(us.correct('23th'), false, 'should support compounds (5)')

    st.equal(us.correct('23rd'), true, 'should support compounds (6)')

    st.equal(us.correct('12th'), true, 'should support compounds (7)')

    st.equal(us.correct('22nd'), true, 'should support compounds (8)')

    st.equal(
      de.correct('.'),
      false,
      'should not check words shorter than `COMPOUNDMIN` (coverage)'
    )

    st.equal(
      us.correct('thinking'),
      true,
      'should support rules (used to be a bug for the US dictionary)'
    )

    st.end()
  })

  t.test('nspell#suggest(value)', function(st) {
    st.deepEqual(
      us.suggest('color'),
      [],
      'should return an empty array when correct (1)'
    )

    st.deepEqual(
      us.suggest('c'),
      [],
      'should return an empty array when correct (2)'
    )

    st.deepEqual(us.suggest('colour'), ['color'], 'should suggest alternatives')

    st.deepEqual(
      us.suggest('propper'),
      ['dropper', 'proper', 'cropper', 'popper', 'propped', 'prosper'],
      'should suggest alternatives'
    )

    st.deepEqual(
      us.suggest('Ghandi'),
      ['shandy', 'Brandi', 'Ghana', 'Grand', 'Grandee', 'Grands', 'handy'],
      'should suggest alternatives'
    )

    st.deepEqual(
      us.suggest(' '),
      [],
      'should return an empty array for empty values'
    )

    st.ok(us.suggest('.').length, 'should try for non-words')

    st.deepEqual(
      us.suggest('Colour'),
      ['Color'],
      'should suggest alternatives for sentence-case'
    )

    st.deepEqual(
      us.suggest('COLOUR'),
      ['COLOR'],
      'should suggest alternatives for upper-case'
    )

    st.deepEqual(
      us.suggest('coLOUR'),
      ['coLOR'],
      'should suggest alternatives for funky-case'
    )

    st.deepEqual(
      us.suggest('html'),
      ['HTML'],
      'should suggest uppercase versions'
    )

    st.deepEqual(
      us.suggest('collor'),
      ['color', 'collar', 'colloq'],
      'should suggest removals'
    )

    st.not(us.suggest('coor').indexOf('color'), -1, 'should suggest additions')

    st.deepEqual(
      us.suggest('cloor'),
      ['floor', 'color'],
      'should suggest switches'
    )

    st.deepEqual(us.suggest('cokor'), ['color'], 'should suggest insertions')

    st.deepEqual(
      us.suggest('bulshit'),
      ['bolshie'],
      'should not suggest alternatives marked with `NOSUGGEST`'
    )

    st.deepEqual(
      us.suggest('consize'),
      ['concise'],
      'should suggest based on replacements'
    )

    st.deepEqual(
      us.suggest('npmnpmnpmnpmnpmnpmnpmnpmnpmnpmnpmnpmnpmnpmnpm'),
      [],
      'should not overflow on too long values'
    )

    st.end()
  })

  t.test('nspell#add(value)', function(st) {
    st.equal(
      us.correct('npm'),
      false,
      'should initially be marked as incorrect'
    )

    st.deepEqual(
      us.suggest('npm'),
      ['bpm', 'pm', 'ppm', 'rpm', 'wpm', 'Nam', 'NM', 'Np', 'NPR'],
      'should initially receive suggestions'
    )

    st.equal(us.add('npm'), us, 'should return the context object')

    st.equal(us.correct('npm'), true, 'should now mark as correct')

    st.deepEqual(
      us.suggest('npm'),
      [],
      'should now no longer receive suggestions'
    )

    st.end()
  })

  t.test('nspell#add(value, model)', function(st) {
    // `azc` is a Dutch word only properly spelled in its lower-case form.
    st.equal(nl.add('npm', 'azc'), nl, 'should return the context object')

    st.equal(nl.correct('npm'), true, 'should match affixes (1)')
    st.equal(nl.correct('NPM'), false, 'should match affixes (2)')
    st.equal(nl.correct('Npm'), false, 'should match affixes (3)')

    st.equal(us.correct('point'), true, 'should support models (1, GH-8)')
    st.equal(us.correct('points'), true, 'should support models (2, GH-8)')
    us.add('datapoint', 'point')
    st.equal(us.correct('datapoint'), true, 'should support models (3, GH-8)')
    st.equal(us.correct('datapoints'), true, 'should support models (4, GH-8)')

    nl.remove('npm')
    us.remove('datapoint')

    st.end()
  })

  t.test('nspell#remove(value)', function(st) {
    st.equal(us.correct('npm'), true, 'should initially be marked as correct')

    st.deepEqual(
      us.suggest('npm'),
      [],
      'should initially receive no suggestions'
    )

    st.equal(us.remove('npm'), us, 'should return the context object')

    st.equal(us.correct('npm'), false, 'should now mark as incorrect')

    st.deepEqual(
      us.suggest('npm'),
      ['bpm', 'pm', 'ppm', 'rpm', 'wpm', 'Nam', 'NM', 'Np', 'NPR'],
      'should now receive suggestions'
    )

    st.end()
  })

  t.test('nspell#personal(buf|string)', function(st) {
    var personal = 'Supercalifragilisticexpialidocious'
    var word = personal.toLowerCase()

    // <3 Mary Poppins.
    st.equal(us.correct(personal), false, 'set-up')

    st.equal(us.personal(personal), us, 'should return the context object')

    st.equal(
      us.correct(personal),
      true,
      'should mark personal terms as correct'
    )

    st.deepEqual(us.suggest(word), [personal], 'should suggest personal terms')

    st.equal(nl.correct('eierlevendbarend'), true, 'should forbid words (1)')

    nl.personal('*eierlevendbarend\nnpm/azc\n')

    st.equal(nl.correct('eierlevendbarend'), false, 'should forbid words (2)')

    st.deepEqual(nl.suggest('eierlevendbaren'), [], 'should forbid words (3)')

    st.equal(nl.correct('npm'), true, 'should match affixes (1)')
    st.equal(nl.correct('NPM'), false, 'should match affixes (2)')

    // Clean.
    us.remove(personal)
    nl.remove('eierlevendbarend')
    nl.remove('npm')

    st.end()
  })

  t.test('nspell#spell(value)', function(st) {
    var spell
    var aff
    var dic

    dic = ['3', 'foo', 'bar/a', 'baz/b', ''].join('\n')

    aff = ['SET UTF-8', '', 'FORBIDDENWORD a', 'WARN b', ''].join('\n')

    spell = nspell(aff, dic)

    st.deepEqual(
      spell.spell('foo'),
      {correct: true, forbidden: false, warn: false},
      'should include `correct: true` for correct results'
    )

    st.deepEqual(
      spell.spell('qux'),
      {correct: false, forbidden: false, warn: false},
      'should include `correct: false` for incorrect results'
    )

    st.deepEqual(
      spell.spell('bar'),
      {correct: false, forbidden: true, warn: false},
      'should include `forbidden: true` for forbidden results'
    )

    st.deepEqual(
      spell.spell('baz'),
      {correct: true, forbidden: false, warn: true},
      'should include `warn: true` for warnings'
    )

    st.end()
  })

  t.end()
})

test('broken dictionaries', function(t) {
  t.plan(1)

  t.test('dictionary-cs', function(st) {
    var spell

    st.plan(2)

    st.doesNotThrow(function() {
      spell = nspell(dictionaries[CS])
    }, 'should not throw for invalid affix regexes - GH-5')

    st.deepEqual(
      spell.suggest('znelěcznelěcznelěcznelěcznelěcznelěc'),
      [],
      'should work'
    )
  })
})

test('parse dictionaries', function(t) {
  t.plan(2)

  t.test('iconv and oconv', function(st) {
    var dic = ['2', 'ĳdel', 'ĳdeltuit'].join('\n')
    var aff = [
      'SET UTF-8',
      '',
      'ICONV 1',
      'ICONV ij ĳ',
      '',
      'OCONV 1',
      'OCONV ĳ ij'
    ].join('\n')
    var spell = nspell(aff + '\n', dic + '\n')

    st.equal(spell.correct('ijdel'), true, 'should support iconv (#1)')
    st.equal(spell.correct('ĳdel'), true, 'should support iconv (#2)')
    st.deepEqual(
      spell.suggest('ijde'),
      ['ijdel', 'Ĳdel'],
      'should support oconv (#1)'
    )
    st.deepEqual(
      spell.suggest('ĳde'),
      ['ijdel', 'Ĳdel'],
      'should support oconv (#2)'
    )

    st.end()
  })

  t.test('slashes and comments', function(st) {
    var dic = [
      '5',
      'aaa\\//A',
      'bbb/#*',
      'ccc/#* #test',
      'ddd#/A',
      'eee#test'
    ].join('\n')
    var spell = nspell('SET UTF-8\n', dic)

    st.equal(spell.correct('aaa/'), true, 'should see slash (/) as word')

    st.deepEqual(spell.data.bbb, ['#', '*'], 'should see hash (#) as flag')

    st.deepEqual(
      spell.data.ccc,
      ['#', '*'],
      'should see first hash (#) as flag and second hash as comment'
    )

    st.equal(spell.correct('ddd'), true, 'should see hash (#) as comment')

    st.equal(spell.correct('eee'), true, 'should see hash (#) as comment')

    st.end()
  })
})
