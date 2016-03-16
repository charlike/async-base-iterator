# [async-base-iterator][author-www-url] [![npmjs.com][npmjs-img]][npmjs-url] [![The MIT License][license-img]][license-url] 

> Basic iterator for [async][] library that handles asynchronous and synchronous functions, also emits `beforeEach` and `afterEach` events. Used in [async-control][].

[![code climate][codeclimate-img]][codeclimate-url] [![standard code style][standard-img]][standard-url] [![travis build status][travis-img]][travis-url] [![coverage status][coveralls-img]][coveralls-url] [![dependency status][david-img]][david-url]

## Install
```
npm i async-base-iterator --save
```

## Usage
> For more use-cases see the [tests](./test.js)

```js
const asyncBaseIterator = require('async-base-iterator')
```

### [AsyncBaseIterator](index.js#L42)
> Initialize `AsyncBaseIterator` with `options`.

**Params**

* `options` **{Object=}**: pass `beforeEach` and `afterEach` hooks or `settle`.    

**Example**

```js
var ctrl = require('async')
var AsyncBaseIterator = require('async-base-iterator').AsyncBaseIterator
var base = new AsyncBaseIterator({ settle: true })

base.on('beforeEach', function (fn) {
  console.log('before each:', fn.name)
})
base.on('afterEach', function (fn, err, res) {
  console.log('after each:', fn.name)
  console.log('err?', err)
  console.log('result of', fn.name, 'is', res)
})

ctrl.mapSeries([
  function one () { return 1 },
  function two (done) { done(null, 2) },
  function three () { return 3 },
], base.makeIterator(), console.log) // => [1, 2, 3]
```

### [.makeIterator](index.js#L105)
> Make iterator to be passed to [async][] lib.

**Params**

* `options` **{Object=}**: pass `beforeEach` and `afterEach` hooks or `settle`.    
* `returns` **{Function}**: iterator for `async.map` and `async.mapSeries`.  

**Events**

* `beforeEach` with signature `fn, context, base`  
* `afterEach` with signature `fn, err, res`  
* `error` with signature `err, fn`  

**Example**

```js
var ctrl = require('async')
var base = require('async-base-iterator')
var iterator = base.makeIterator({
  settle: true,
  beforeEach: function beforeEach (fn) {
    console.log(fn)
  }
})

function throwError () {
  throw new Error('two err')
}

ctrl.mapSeries([
  function one () { return 1 },
  function two () {
    throwError()
    return 2
  },
  function three (cb) { cb(null, 3) }
], iterator, function (err, res) {
  // `err` is always `null` when `settle: true`
  console.log(err) // => null
  console.log(res) // => [1, [Error: two err], 3]
})
```

## Related
* [async](https://www.npmjs.com/package/async): Higher-order functions and common patterns for asynchronous code | [homepage](https://github.com/caolan/async)
* [iterator-async](https://www.npmjs.com/package/iterator-async): Iterate over a stack of async functions. | [homepage](https://github.com/doowb/iterator-async)
* [iterator-promise](https://www.npmjs.com/package/iterator-promise): Iterate over a stack of functions. | [homepage](https://github.com/doowb/iterator-promise)
* [letta](https://www.npmjs.com/package/letta): Let's move to promises! Drop-in replacement for `co@4` (passing 100% tests),… [more](https://www.npmjs.com/package/letta) | [homepage](https://github.com/hybridables/letta)
* [relike](https://www.npmjs.com/package/relike): Simple promisify a callback-style function with sane defaults. Support promisify-ing sync… [more](https://www.npmjs.com/package/relike) | [homepage](https://github.com/hybridables/relike)
* [then-callback](https://www.npmjs.com/package/then-callback): Wrap a promise to allow passing callback to `.then` of given… [more](https://www.npmjs.com/package/then-callback) | [homepage](https://github.com/hybridables/then-callback)

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/async-base-iterator/issues/new).  
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.

## [Charlike Make Reagent](http://j.mp/1stW47C) [![new message to charlike][new-message-img]][new-message-url] [![freenode #charlike][freenode-img]][freenode-url]

[![tunnckoCore.tk][author-www-img]][author-www-url] [![keybase tunnckoCore][keybase-img]][keybase-url] [![tunnckoCore npm][author-npm-img]][author-npm-url] [![tunnckoCore twitter][author-twitter-img]][author-twitter-url] [![tunnckoCore github][author-github-img]][author-github-url]

[async]: https://github.com/caolan/async
[async-control]: https://github.com/hybridables/async-control

[npmjs-url]: https://www.npmjs.com/package/async-base-iterator
[npmjs-img]: https://img.shields.io/npm/v/async-base-iterator.svg?label=async-base-iterator

[license-url]: https://github.com/tunnckoCore/async-base-iterator/blob/master/LICENSE
[license-img]: https://img.shields.io/badge/license-MIT-blue.svg

[codeclimate-url]: https://codeclimate.com/github/tunnckoCore/async-base-iterator
[codeclimate-img]: https://img.shields.io/codeclimate/github/tunnckoCore/async-base-iterator.svg

[travis-url]: https://travis-ci.org/tunnckoCore/async-base-iterator
[travis-img]: https://img.shields.io/travis/tunnckoCore/async-base-iterator/master.svg

[coveralls-url]: https://coveralls.io/r/tunnckoCore/async-base-iterator
[coveralls-img]: https://img.shields.io/coveralls/tunnckoCore/async-base-iterator.svg

[david-url]: https://david-dm.org/tunnckoCore/async-base-iterator
[david-img]: https://img.shields.io/david/tunnckoCore/async-base-iterator.svg

[standard-url]: https://github.com/feross/standard
[standard-img]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

[author-www-url]: http://www.tunnckocore.tk
[author-www-img]: https://img.shields.io/badge/www-tunnckocore.tk-fe7d37.svg

[keybase-url]: https://keybase.io/tunnckocore
[keybase-img]: https://img.shields.io/badge/keybase-tunnckocore-8a7967.svg

[author-npm-url]: https://www.npmjs.com/~tunnckocore
[author-npm-img]: https://img.shields.io/badge/npm-~tunnckocore-cb3837.svg

[author-twitter-url]: https://twitter.com/tunnckoCore
[author-twitter-img]: https://img.shields.io/badge/twitter-@tunnckoCore-55acee.svg

[author-github-url]: https://github.com/tunnckoCore
[author-github-img]: https://img.shields.io/badge/github-@tunnckoCore-4183c4.svg

[freenode-url]: http://webchat.freenode.net/?channels=charlike
[freenode-img]: https://img.shields.io/badge/freenode-%23charlike-5654a4.svg

[new-message-url]: https://github.com/tunnckoCore/ama
[new-message-img]: https://img.shields.io/badge/ask%20me-anything-green.svg

