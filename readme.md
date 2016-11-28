# nspell [![Build Status][build-badge]][build-status] [![Coverage Status][coverage-badge]][coverage-status]

Hunspell compatible spell-checker in plain-vanilla JavaScript.

## Installation

[npm][]:

```bash
npm install nspell
```

You probably also want to install some [dictionaries][]:

```bash
npm install dictionary-en-us
```

## Table of Contents

*   [Usage](#usage)
*   [API](#api)
    *   [NSpell(aff, dic)](#nspellaff-dic)
    *   [NSpell#correct(word)](#nspellcorrectword)
    *   [NSpell#suggest(word)](#nspellsuggestword)
    *   [NSpell#spell(word)](#nspellspellword)
    *   [NSpell#add(word\[, model\])](#nspelladdword-model)
    *   [NSpell#remove(word)](#nspellremoveword)
    *   [NSpell#wordCharacters()](#nspellwordcharacters)
    *   [NSpell#dictionary(dic)](#nspelldictionarydic)
    *   [NSpell#personal(dic)](#nspellpersonaldic)
*   [License](#license)

## Usage

```js
var dictionary = require('dictionary-en-us');
var nspell = require('nspell');

dictionary(function (err, dict) {
  if (err) {
    throw err;
  }

  var spell = nspell(dict);

  console.log(spell.correct('colour'));
  // false

  console.log(spell.suggest('colour'));
  // [ 'color' ]

  console.log(spell.correct('color'));
  // true

  console.log(spell.correct('npm'));
  // false

  spell.add('npm');

  console.log(spell.correct('npm'));
  // true
});
```

## API

### `NSpell(aff, dic)`

Create a new spell checker.

###### Signatures

*   `NSpell(aff, dic)`;
*   `NSpell(dictionary)`.

###### Parameters

*   `aff` (`Buffer` or `string`)
    — Affix document to use.  Must be in UTF-8 when buffer;
*   `dic` (`Buffer` or `string`)
    — Dictionary document to use.  Must be in UTF-8 when buffer;
*   `dictionary` (`Object`)
    — Object with `aff` and `dic` properties.

###### Returns

New instance of `NSpell`.

### `NSpell#correct(word)`

Check if `word` is correctly spelled.

###### Example

```js
spell.correct('color'); // true
spell.correct('html'); // false
spell.correct('abreviation'); // false
```

###### Parameters

*   `word` (`string`) — Word to check for correct spelling.

###### Returns

`boolean` — Whether `word` is correctly spelled.

### `NSpell#suggest(word)`

Suggest correctly spelled words close to `word`.

###### Example

```js
spell.suggest('colour'); // [ 'color' ]
spell.suggest('color'); // []
spell.suggest('html'); // [ 'HTML' ]
spell.suggest('alot'); // [ 'allot', 'slot', 'clot', ... ]
```

###### Parameters

*   `word` (`string`) — Word to suggest spelling corrections for.

###### Returns

`Array.<string>` — A list with zero or more suggestions.

### `NSpell#spell(word)`

Get spelling information for `word`.

###### Example

```js
spell.spell('colour');
// { correct: false, forbidden: false, warn: false }

spell.spell('color');
// { correct: true, forbidden: false, warn: false }
```

###### Parameters

*   `word` (`string`) — Word to check.

###### Returns

`Object`, with the following properties:

*   `correct` (`boolean`)
    — Whether `word` is correctly spelled;
*   `forbidden` (`boolean`)
    — Whether `word` is actually correct, but forbidden from showing
    up as such (often by the users wish);
*   `warn` (`boolean`)
    — Whether `word` is correct, but should trigger a warning
    (rarely used in dictionaries).

### `NSpell#add(word[, model])`

Add `word` to known words.  If no model is given, the word will be
marked as correct in the future, and will show up in spelling
suggestions.  If a model is given, `word` will be handled the same
as `model`.

###### Example

```js
spell.correct('npm'); // false
spell.suggest('nnpm'); // [ 'ppm', 'bpm', ... ]

spell.add('npm');

spell.correct('npm'); // true
spell.suggest('nnpm'); // [ 'npm' ]
```

###### Parameters

*   `word` (`string`) — Word to add;
*   `model` (`string`, optional) — Known word to model `word` after.

###### Returns

`NSpell` — The operated on instance.

### `NSpell#remove(word)`

Remove `word` from the known words.

###### Example

```js
spell.correct('color'); // true

spell.remove('color');

spell.correct('color'); // false
```

###### Parameters

*   `word` (`string`) — Word to add;

###### Returns

`NSpell` — The operated on instance.

### `NSpell#wordCharacters()`

Get extra word characters defined by the loaded affix file.
Most affix files don’t set these, but for example the [en-US][]
dictionary sets `0123456789`.

###### Example

```js
spell.wordCharacters(); // '0123456789'
```

###### Returns

`string?` — The defined word characters, if any.

### `NSpell#dictionary(dic)`

Add an extra dictionary to the spellchecker.

###### Example

```js
spell.dictionary([
  '5',
  'npm',
  'nully',
  'rebase',
  'SHA',
  'stringification'
].join('\n'));
```

###### Parameters

*   `dic` (`Buffer` or `string`)
    — Dictionary document to use.  Must be in UTF-8 when buffer.

###### Returns

`NSpell` — The operated on instance.

###### Note

The given `dic` must be designed to work with the already loaded
affix.  It’s not possible to add dictionary files from different
languages together (use two `NSpell` instances for that).

### `NSpell#personal(dic)`

Add a personal dictionary.

###### Example

```js
spell.personal([
  'foo',
  'bar/color',
  '*baz'
].join('\n'));
```

###### Parameters

*   `dic` (`Buffer` or `string`)
    — Dictionary document to use.  Must be in UTF-8 when buffer.

###### Returns

`NSpell` — The operated on instance.

###### Note

Lines starting with a `*` mark a word as forbidden, which results in
them being seen as incorrect, and prevents them from showing up in
suggestions.  Splitting a line in two with a slash, adds the left side
and models it after the already known right word.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/wooorm/nspell.svg

[build-status]: https://travis-ci.org/wooorm/nspell

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/nspell.svg

[coverage-status]: https://codecov.io/github/wooorm/nspell

[npm]: https://docs.npmjs.com/cli/install

[license]: LICENSE

[author]: http://wooorm.com

[dictionaries]: https://github.com/wooorm/dictionaries

[en-us]: https://github.com/wooorm/dictionaries/tree/master/dictionaries/en_US
