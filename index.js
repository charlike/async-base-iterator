/*!
 * async-base-iterator <https://github.com/tunnckoCore/async-base-iterator>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var utils = require('./utils')
var AppBase = require('async-simple-iterator').AsyncSimpleIterator

/**
 * > Initialize `AsyncBaseIterator` with `options`, see also [async-simple-iterator][].
 *
 * **Example**
 *
 * ```js
 * var ctrl = require('async')
 * var AsyncBaseIterator = require('async-base-iterator').AsyncBaseIterator
 * var base = new AsyncBaseIterator({
 *   beforeEach: function (fn) {
 *     console.log('before each:', fn.name)
 *   },
 *   error: function (err, res, fn) {
 *     console.log('on error:err:', err)
 *     console.log('on error:fn:', fn.name)
 *   }
 * })
 *
 * base.on('afterEach', function (err, res, fn) {
 *   console.log('after each:', fn.name)
 *   console.log('err?', err)
 *   console.log('result of', fn.name, 'is', res)
 * })
 *
 * ctrl.mapSeries([
 *   function one () { return 1 },
 *   function two (done) { done(null, 2) },
 *   function three () { return 3 },
 * ], base.makeIterator(), console.log) // => [1, 2, 3]
 * ```
 *
 * @param {Object=} `options` Pass `beforeEach`, `afterEach` and `error` hooks or `settle` option.
 * @api public
 */

function AsyncBaseIterator (options) {
  if (!(this instanceof AsyncBaseIterator)) {
    return new AsyncBaseIterator(options)
  }
  AppBase.call(this, options)
  this.defaultOptions({context: {}})
}

AppBase.extend(AsyncBaseIterator)

/**
 * > Make iterator to be passed to [async][] lib.
 *
 * **Example**
 *
 * ```js
 * var ctrl = require('async')
 * var base = require('async-base-iterator')
 * var iterator = base.makeIterator({
 *   settle: true,
 *   beforeEach: function (fn) {
 *     console.log('before each:', fn.name)
 *   }
 * })
 *
 * function throwError () {
 *   throw new Error('two err')
 * }
 *
 * ctrl.mapSeries([
 *   function one () { return 1 },
 *   function two () {
 *     throwError()
 *     return 2
 *   },
 *   function three (cb) { cb(null, 3) }
 * ], iterator, function (err, res) {
 *   // `err` is always `null` when `settle: true`
 *   console.log(err) // => null
 *   console.log(res) // => [1, [Error: two err], 3]
 * })
 * ```
 *
 * @emit  `beforeEach` with signature `fn, next`
 * @emit  `afterEach` with signature `err, res, fn, next`
 * @emit  `error` with signature `err, res, fn, next`
 *
 * @name   .makeIterator
 * @param  {Object=} `options` Pass `beforeEach`, `afterEach` and `error` hooks or `settle` option.
 * @return {Function} Iterator that can be passed to any [async][] method.
 * @api public
 */

AppBase.define(AsyncBaseIterator.prototype, 'makeIterator', function makeIterator (options) {
  return this.wrapIterator(function (fn, next) {
    var params = utils.isArray(this.options.params) && this.options.params || []
    var args = params.concat(next)
    var func = typeof this.options.letta === 'function' ? this.options.letta : utils.relike
    utils.then(func.apply(this.options.context, [fn].concat(args))).then(next)
  }, options)
})

/**
 * Expose `AsyncBaseIterator` instance
 *
 * @type {Object}
 * @api private
 */

module.exports = new AsyncBaseIterator()

/**
 * Expose `AsyncBaseIterator` constructor
 *
 * @type {Function}
 * @api private
 */

module.exports.AsyncBaseIterator = AsyncBaseIterator
