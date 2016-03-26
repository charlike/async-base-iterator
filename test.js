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

test('should be able to pass params to functions through options.params', function (done) {
  var iterator = base.makeIterator({
    params: [{bar: 'qux'}, 3]
  })
  ctrl.mapSeries([
    function one (obj, num) {
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
