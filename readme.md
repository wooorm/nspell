# nspell

[![Travis][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Hunspell-like spell-checker in plain-vanilla JavaScript.

**nspell** contains most of the essential core of Hunspell.
It does not contain a tokeniser but leaves many details up to implementors.
The main difference, conceptually, is that Hunspell is based on the user and
their preferences, whereas **nspell** is based on explicitly passed in options,
thus producing the same results regardless of OS, file system, or environment.

## Contents

*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`NSpell(dictionary)`](#nspelldictionary)
    *   [`NSpell#correct(word)`](#nspellcorrectword)
    *   [`NSpell#suggest(word)`](#nspellsuggestword)
    *   [`NSpell#spell(word)`](#nspellspellword)
    *   [`NSpell#add(word[, model])`](#nspelladdword-model)
    *   [`NSpell#remove(word)`](#nspellremoveword)
    *   [`NSpell#wordCharacters()`](#nspellwordcharacters)
    *   [`NSpell#dictionary(dic)`](#nspelldictionarydic)
    *   [`NSpell#personal(dic)`](#nspellpersonaldic)
*   [Dictionaries](#dictionaries)
    *   [Affix documents](#affix-documents)
    *   [Dictionary documents](#dictionary-documents)
    *   [Personal dictionary documents](#personal-dictionary-documents)
    *   [Affix options](#affix-options)
*   [License](#license)

## Install

[npm][]:

```sh
npm install nspell
```

You probably also want to install some [dictionaries][]:

```sh
npm install dictionary-en
```

## Use

```js
var dictionary = require('dictionary-en')
var nspell = require('nspell')

dictionary(ondictionary)

function ondictionary(err, dict) {
  if (err) {
    throw err
  }

  var spell = nspell(dict)

  console.log(spell.correct('colour')) // => false
  console.log(spell.suggest('colour')) // => ['color']
  console.log(spell.correct('color')) // => true
  console.log(spell.correct('npm')) // => false
  spell.add('npm')
  console.log(spell.correct('npm')) // => true
}
```

## API

### `NSpell(dictionary)`

Create a new spell checker.
Passing an affix document is required, through any of the below mentioned
signatures.
**nspell** is useless without at least one `dic` passed: make sure to pass one
either in the constructor or to [`nspell#dictionary`][dictionary].

###### Signatures

*   `NSpell(dictionary)`
*   `NSpell(aff[, dic])`
*   `NSpell(dictionaries)`

###### Parameters

*   `dictionary` (`Object`)
    — Object with `aff` (required) and `dic` (optional) properties
*   `aff` (`Buffer` or `string`)
    — Affix document to use.  Must be in UTF-8 when buffer
*   `dic` (`Buffer` or `string`)
    — Dictionary document to use.  Must be in UTF-8 when buffer
*   `dictionaries` (`Array.<Dictionary>`)
    — List of `dictionary` objects.  The first must have an `aff` key,
    other `aff` keys are ignored

###### Returns

New instance of `NSpell`.

### `NSpell#correct(word)`

Check if `word` is correctly spelled.

###### Example

```js
spell.correct('color') // => true
spell.correct('html') // => false
spell.correct('abreviation') // => false
```

###### Parameters

*   `word` (`string`) — Word to check for correct spelling

###### Returns

`boolean` — Whether `word` is correctly spelled.

### `NSpell#suggest(word)`

Suggest correctly spelled words close to `word`.

###### Example

```js
spell.suggest('colour') // => ['color']
spell.suggest('color') // => []
spell.suggest('html') // => ['HTML']
spell.suggest('alot') // => ['allot', 'slot', 'clot', …]
```

###### Parameters

*   `word` (`string`) — Word to suggest spelling corrections for

###### Returns

`Array.<string>` — List with zero or more suggestions.

### `NSpell#spell(word)`

Get spelling information for `word`.

###### Example

```js
spell.spell('colour') // => {correct: false, forbidden: false, warn: false}
spell.spell('color') // => {correct: true, forbidden: false, warn: false}
```

###### Parameters

*   `word` (`string`) — Word to check

###### Returns

`Object`, with the following properties:

*   `correct` (`boolean`)
    — Whether `word` is correctly spelled
*   `forbidden` (`boolean`)
    — Whether `word` is actually correct, but forbidden from showing up as such
    (often by the users wish)
*   `warn` (`boolean`)
    — Whether `word` is correct, but should trigger a warning
    (rarely used in dictionaries)

### `NSpell#add(word[, model])`

Add `word` to known words.
If no model is given, the word will be marked as correct in the future, and will
show up in spelling suggestions.
If a model is given, `word` will be handled the same as `model`.

###### Example

```js
spell.correct('npm') // => false
spell.suggest('nnpm') // => ['ppm', 'bpm', …]

spell.add('npm')

spell.correct('npm') // => true
spell.suggest('nnpm') // => ['npm']
```

###### Parameters

*   `word` (`string`) — Word to add
*   `model` (`string`, optional) — Known word to model `word` after

###### Returns

`NSpell` — Operated on instance.

### `NSpell#remove(word)`

Remove `word` from the known words.

###### Example

```js
spell.correct('color') // => true

spell.remove('color')

spell.correct('color') // => false
```

###### Parameters

*   `word` (`string`) — Word to add

###### Returns

`NSpell` — Operated on instance.

### `NSpell#wordCharacters()`

Get extra word characters defined by the loaded affix file.
Most affix files don’t set these, but for example the [en][] dictionary sets
`0123456789`.

###### Example

```js
spell.wordCharacters() // => '0123456789'
```

###### Returns

`string?` — Defined word characters, if any.

### `NSpell#dictionary(dic)`

Add an extra dictionary to the spellchecker.

###### Example

```js
spell.dictionary(
  ['5', 'npm', 'nullish', 'rebase', 'SHA', 'stringification'].join('\n')
)
```

###### Parameters

*   `dic` (`Buffer` or `string`)
    — Dictionary document to use; must be in UTF-8 when buffer

###### Returns

`NSpell` — Operated on instance.

###### Note

The given `dic` must be designed to work with the already loaded affix.
It’s not possible to add dictionary files from different languages together
(use two `NSpell` instances for that).

### `NSpell#personal(dic)`

Add a personal dictionary.

###### Example

```js
spell.personal(['foo', 'bar/color', '*baz'].join('\n'))
```

###### Parameters

*   `dic` (`Buffer` or `string`)
    — Dictionary document to use; must be in UTF-8 when buffer

###### Returns

`NSpell` — Operated on instance.

###### Note

Lines starting with a `*` mark a word as forbidden, which results in them being
seen as incorrect, and prevents them from showing up in suggestions.
Splitting a line in two with a slash, adds the left side and models it after the
already known right word.

## Dictionaries

**nspell** supports many parts of Hunspell-style dictionaries.
Essentially, the concept of a dictionary consists of one “affix” document, and
one or more “dictionary” documents.
The documents are tightly linked, so it’s not possible to use a Dutch affix with
an English dictionary document.

Below is a short introduction, see [hunspell(5)][hunspell-5] for more
information.

### Affix documents

Affix documents define the language, keyboard, flags, and much more.
For example, a paraphrased [Dutch][nl] affix document looks as follows:

```text
SET UTF-8

KEY qwertyuiop|asdfghjkl|zxcvbnm|qawsedrftgyhujikolp|azsxdcfvgbhnjmk|aze|qsd|lm|wx|aqz|qws|

WORDCHARS '’0123456789ĳ.-\/

REP 487
REP e en
REP ji ĳ
REP u oe
# …

SFX An Y 11
SFX An 0 de d
SFX An 0 fe f
SFX An 0 ge g
# …
```

Not every option is supported in **nspell**.
See [Affix options][affix-options] for a list of all options and which ones are
supported.

### Dictionary documents

Dictionary documents contain words and flags applying to those words.
For example:

```text
3
foo
bar/a
baz/ab
```

The above document contains three words, as the count on the first line shows.
Further lines each start with a word.
Some lines contain flags, as denoted by the slashes.
What those flags do, and the size of flags, is defined by affix documents.

### Personal dictionary documents

Personal dictionaries are not intertwined with affix document.
They define new words and words to forbid.
For example:

```text
foo
bar/baz
*qux
```

In the above example, `foo` is added as a known word; `bar` is added as well,
but modelled after the existing word `baz`; finally, `qux` is marked as a
forbidden word.

### Affix options

The following affix options are known to Hunspell.
The checked ones are supported by **nspell**.

###### General

*   [ ] `SET encoding` (UTF-8 is implied)
*   [x] `FLAG value`
*   [ ] `COMPLEXPREFIXES`
*   [ ] `LANG langcode`
*   [ ] `IGNORE characters`
*   [ ] `AF number_of_flag_vector_aliases`
*   [ ] `AF flag_vector`
*   [ ] `AF definitions in the affix file:`
*   [ ] `AF flag_vector`

###### Suggestion

*   [x] `KEY characters_separated_by_vertical_line_optionally`
*   [x] `TRY characters`
*   [x] `NOSUGGEST flag`
*   [ ] `MAXCPDSUGS num`
*   [ ] `MAXNGRAMSUGS num`
*   [ ] `MAXDIFF [0-10]`
*   [ ] `ONLYMAXDIFF`
*   [ ] `NOSPLITSUGS`
*   [ ] `SUGSWITHDOTS`
*   [x] `REP number_of_replacement_definitions`
*   [x] `REP what replacement`
*   [ ] `MAP number_of_map_definitions`
*   [ ] `MAP string_of_related_chars_or_parenthesized_character_sequences`
*   [ ] `PHONE number_of_phone_definitions`
*   [ ] `PHONE what replacement`
*   [x] `WARN flag`
*   [x] `FORBIDWARN`

###### Compounding

*   [ ] `BREAK number_of_break_definitions`
*   [ ] `BREAK character_or_character_sequence`
*   [x] `COMPOUNDRULE number_of_compound_definitions`
*   [x] `COMPOUNDRULE compound_pattern`
*   [x] `COMPOUNDMIN num`
*   [ ] `COMPOUNDFLAG flag`
*   [ ] `COMPOUNDBEGIN flag`
*   [ ] `COMPOUNDLAST flag`
*   [ ] `COMPOUNDMIDDLE flag`
*   [x] `ONLYINCOMPOUND flag`
*   [ ] `COMPOUNDPERMITFLAG flag`
*   [ ] `COMPOUNDFORBIDFLAG flag`
*   [ ] `COMPOUNDMORESUFFIXES`
*   [ ] `COMPOUNDROOT flag`
*   [ ] `COMPOUNDWORDMAX number`
*   [ ] `CHECKCOMPOUNDDUP`
*   [ ] `CHECKCOMPOUNDREP`
*   [ ] `CHECKCOMPOUNDCASE`
*   [ ] `CHECKCOMPOUNDTRIPLE`
*   [ ] `SIMPLIFIEDTRIPLE`
*   [ ] `CHECKCOMPOUNDPATTERN number_of_checkcompoundpattern_definitions`
*   [ ] `CHECKCOMPOUNDPATTERN endchars[/flag] beginchars[/flag] [replacement]`
*   [ ] `FORCEUCASE flag`
*   [ ] `COMPOUNDSYLLABLE max_syllable vowels`
*   [ ] `SYLLABLENUM flags`

###### Affix creation

*   [x] `PFX flag cross_product number`
*   [x] `PFX flag stripping prefix [condition [morphological_fields…]]`
*   [x] `SFX flag cross_product number`
*   [x] `SFX flag stripping suffix [condition [morphological_fields…]]`

###### Other

*   [ ] `CIRCUMFIX flag`
*   [x] `FORBIDDENWORD flag`
*   [ ] `FULLSTRIP`
*   [x] `KEEPCASE flag`
*   [x] `ICONV number_of_ICONV_definitions`
*   [x] `ICONV pattern pattern2`
*   [x] `OCONV number_of_OCONV_definitions`
*   [x] `OCONV pattern pattern2`
*   [ ] `LEMMA_PRESENT flag`
*   [x] `NEEDAFFIX flag`
*   [ ] `PSEUDOROOT flag`
*   [ ] `SUBSTANDARD flag`
*   [x] `WORDCHARS characters`
*   [ ] `CHECKSHARPS`

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/nspell/workflows/main/badge.svg

[build]: https://github.com/wooorm/nspell/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/nspell.svg

[coverage]: https://codecov.io/github/wooorm/nspell

[downloads-badge]: https://img.shields.io/npm/dm/nspell.svg

[downloads]: https://www.npmjs.com/package/nspell

[size-badge]: https://img.shields.io/bundlephobia/minzip/nspell.svg

[size]: https://bundlephobia.com/result?p=nspell

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[dictionaries]: https://github.com/wooorm/dictionaries

[en]: https://github.com/wooorm/dictionaries/tree/HEAD/dictionaries/en

[nl]: https://github.com/wooorm/dictionaries/tree/HEAD/dictionaries/nl

[hunspell-5]: https://linux.die.net/man/4/hunspell

[affix-options]: #affix-options

[dictionary]: #nspelldictionarydic
