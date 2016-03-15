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
 * @param {Object=} `options`
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
 * > Setting default options. Settle `false`.
 *
 * @param  {Object=} `options`
 * @return {AsyncBaseIterator} instance for chaining
 * @api public
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
 * @param  {Object=} `options`
 * @return {Function} iterator for `async.map` and `async.mapSeries`
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
