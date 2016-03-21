/*!
 * async-base-iterator <https://github.com/hybridables/async-base-iterator>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var test = require('assertit')
var base = require('./index')
var Ctor = require('./index').AsyncBaseIterator
var asyn = require('async')

/**
 * Fixtures
 */

function one () {
  this.foo = 'bar'
  return this.foo
}
function two (done) {
  test.strictEqual(this.foo, 'bar')
  this.bar = 'baz'
  done(null, this.bar)
}
function three () {
  test.strictEqual(this.bar, 'baz')
  return 'qux'
}
var fns = [one, two, three]

/**
 * Tests
 */

test('should exposed constructor be signleton', function (done) {
  test.strictEqual(typeof Ctor === 'function', true)
  test.strictEqual(typeof Ctor() === 'object', true)
  done()
})

test('should async.mapSeries be settled', function (done) {
  var iterator = base.makeIterator({settle: true})

  function throwError () {
    throw new Error('two err')
  }

  asyn.mapSeries([
    function one () {
      return 1
    },
    function two () {
      throwError()
      /* istanbul ignore next */
      return 2
    },
    function three (cb) {
      cb(null, 3)
    }
  ], iterator, function (err, res) {
    test.strictEqual(err, null)
    test.strictEqual(res.length, 3)
    test.strictEqual(res[0], 1)
    test.strictEqual(res[2], 3)
    test.strictEqual(res[1] instanceof Error, true)
    test.strictEqual(res[1].message, 'two err')
    done()
  })
})

test('should functions share context', function (done) {
  asyn.mapSeries(fns, base.makeIterator(), function (err, res) {
    test.ifError(err)
    test.deepEqual(res, ['bar', 'baz', 'qux'])
    done()
  })
})

test('should listen for beforeEach events', function (done) {
  var res = []
  base.on('beforeEach', function (fn) {
    res.push(fn)
  })
  asyn.mapSeries(fns, base.makeIterator(), function (err) {
    test.ifError(err)
    test.deepEqual(res, fns)
    done()
  })
})

test('should be able to pass hooks through options', function (done) {
  var functions = []
  var results = []

  function beforeEach (fn) {
    functions.push(fn)
  }
  function afterEach (er, res, fn) {
    results.push(res)
  }

  var iterator = base.makeIterator({
    beforeEach: beforeEach,
    afterEach: afterEach
  })

  asyn.mapSeries(fns, iterator, function (err) {
    test.ifError(err)
    test.deepEqual(functions, fns)
    test.deepEqual(results, ['bar', 'baz', 'qux'])
    done()
  })
})
