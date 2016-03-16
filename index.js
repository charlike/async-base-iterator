/*!
 * async-base-iterator <https://github.com/tunnckoCore/async-base-iterator>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var utils = require('./utils')

/**
 * > Initialize `AsyncBaseIterator` with `options`.
 *
 * **Example**
 *
 * ```js
 * var ctrl = require('async')
 * var AsyncBaseIterator = require('async-base-iterator').AsyncBaseIterator
 * var base = new AsyncBaseIterator({ settle: true })
 *
 * base.on('beforeEach', function (fn) {
 *   console.log('before each:', fn.name)
 * })
 * base.on('afterEach', function (fn, err, res) {
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
 * @param {Object=} `options` pass `beforeEach` and `afterEach` hooks or `settle`.
 * @api public
 */
function AsyncBaseIterator (options) {
  if (!(this instanceof AsyncBaseIterator)) {
    return new AsyncBaseIterator(options)
  }
  this.defaultOptions(options)
  utils.Emitter(this)
}

/**
 * > Setting default options. Default `settle` options is `false`.
 *
 * @param  {Object=} `options` pass `beforeEach` and `afterEach` hooks or `settle`.
 * @return {AsyncBaseIterator} instance for chaining.
 * @api private
 */
AsyncBaseIterator.prototype.defaultOptions = function defaultOptions (options) {
  options = utils.extend({settle: false, context: {}}, this.options, options)
  options.settle = typeof options.settle === 'boolean' ? !!options.settle : false
  this.options = options
  return this
}

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
 *   beforeEach: function beforeEach (fn) {
 *     console.log(fn)
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
 * @emit  `beforeEach` with signature `fn, context, base`
 * @emit  `afterEach` with signature `fn, err, res`
 * @emit  `error` with signature `err, fn`
 *
 * @param  {Object=} `options` pass `beforeEach` and `afterEach` hooks or `settle`.
 * @return {Function} iterator for `async.map` and `async.mapSeries`.
 * @api public
 */
AsyncBaseIterator.prototype.makeIterator = function makeIterator (options) {
  options = utils.extend(this.options, options)

  if (typeof options.beforeEach === 'function') {
    this.on('beforeEach', options.beforeEach)
  }
  if (typeof options.afterEach === 'function') {
    this.on('afterEach', options.afterEach)
  }

  return utils.iteratorFactory(this)
}

/**
 * Expose `AsyncBaseIterator` constructor and instance
 */

module.exports = new AsyncBaseIterator()
module.exports.AsyncBaseIterator = AsyncBaseIterator
