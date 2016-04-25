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
var ctrl = require('async')
var isEmitter = require('is-emitter')

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

test('should exposed constructor be signleton', function (done) {
  test.strictEqual(typeof Ctor === 'function', true)
  test.strictEqual(typeof Ctor() === 'object', true)
  done()
})

test('should be event emitter', function (done) {
  var app = new Ctor()
  test.strictEqual(isEmitter(base), true)
  test.strictEqual(isEmitter(app), true)
  done()
})

test('should be AsyncSimpleIterator app and have .wrapIterator method', function (done) {
  test.strictEqual(typeof base.wrapIterator, 'function')
  test.strictEqual(typeof base.makeIterator, 'function')
  done()
})

test('should functions share context', function (done) {
  ctrl.mapSeries(fns, base.makeIterator(), function (err, res) {
    test.ifError(err)
    test.deepEqual(res, ['bar', 'baz', 'qux'])
    done()
  })
})

test('should be able to pass params to functions through `options.params`', function (done) {
  var app = new Ctor()
  var iterator = app.makeIterator({
    params: [{bar: 'qux'}, 3]
  })
  ctrl.mapSeries([
    function one (obj, num) {
      test.deepEqual(this, {})
      test.deepEqual(obj, {bar: 'qux'})
      test.strictEqual(num, 3)
      return obj
    },
    function two (obj, num, next) {
      test.deepEqual(obj, {bar: 'qux'})
      test.strictEqual(num, 3)
      next(null, num)
    }
  ], iterator, function (err, res) {
    test.ifError(err)
    test.deepEqual(res, [{bar: 'qux'}, 3])
    done()
  })
})

test('should be able to pass custom context through `options.context`', function (done) {
  var app = new Ctor()
  var iterator = app.on('error', done).makeIterator({
    context: {aloha: 'ok'}
  })
  ctrl.mapSeries([function (next) {
    test.deepEqual(this, {aloha: 'ok'})
    next()
  }], iterator, done)
})

test('should `settle` option work correctly', function (done) {
  var app = new Ctor()
  var iterator = app.makeIterator({ settle: true })

  ctrl.mapSeries([
    function asyncFnOkey (next) {
      test.deepEqual(this, {})
      next()
    },
    function asyncFnFail (next) {
      next(new Error('some err msg'))
    },
    function syncFnFail () {
      if (Object.keys(this).length === 0) {
        throw new Error('foo err here')
      }
      /* istanbul ignore next */
      return 123
    },
    function (next) {
      next(null, 4)
    }
  ], iterator, function (err, res) {
    test.strictEqual(err, null)
    test.strictEqual(Array.isArray(res), true)
    test.strictEqual(res.length, 4)
    test.strictEqual(res[0], undefined)
    test.strictEqual(res[1] instanceof Error, true)
    test.strictEqual(res[2] instanceof Error, true)
    test.strictEqual(res[1].message, 'some err msg')
    test.strictEqual(res[2].message, 'foo err here')
    test.strictEqual(res[3], 4)
    done()
  })
})

test('should support nesting', function (done) {
  var app = new Ctor({
    context: {a: 'b'},
    params: ['foo', 123]
  })

  ctrl.mapSeries([
    function (foo, num) {
      test.strictEqual(foo, 'foo')
      test.strictEqual(num, 123)
      test.deepEqual(this, {a: 'b'})
      this.one = 111

      return function (foo, num) {
        test.strictEqual(foo, 'foo')
        test.strictEqual(num, 123)
        test.deepEqual(this, { a: 'b', one: 111 })
        this.two = 222

        return function (str, num, next) {
          test.strictEqual(str, 'foo')
          test.strictEqual(num, 123)
          test.deepEqual(this, { a: 'b', one: 111, two: 222 })
          this.a = str

          next(null, {first: str, second: this.two + num})
        }
      }
    },
    function (str) {
      test.deepEqual(this, { a: 'foo', one: 111, two: 222 })
      this.three = 333

      return function (a, num) {
        test.deepEqual(this, { a: str, one: 111, two: 222, three: 333 })
        return this.three + num + str
      }
    }
  ], app.makeIterator(), function doneCallback (err, res) {
    test.deepEqual(res, [{ first: 'foo', second: 345 }, '456foo'])
    done(err)
  })
})
