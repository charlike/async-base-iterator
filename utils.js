'use strict'

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require)

/**
 * Temporarily re-assign `require` to trick browserify and
 * webpack into reconizing lazy dependencies.
 *
 * This tiny bit of ugliness has the huge dual advantage of
 * only loading modules that are actually called at some
 * point in the lifecycle of the application, whilst also
 * allowing browserify and webpack to find modules that
 * are depended on but never actually called.
 */

var fn = require
require = utils // eslint-disable-line no-undef, no-native-reassign

/**
 * Lazily required module dependencies
 */

require('component-emitter', 'Emitter')
require('extend-shallow', 'extend')
require('isarray', 'isArray')
require('relike')
require('then-callback', 'then')

/**
 * Restore `require`
 */

require = fn // eslint-disable-line no-undef, no-native-reassign

utils.iteratorFactory = function iteratorFactory (self) {
  var options = self.options
  var context = options.context || self
  var params = utils.isArray(options.params) && options.params || []

  return function iterator (fn, next) {
    self.emit('beforeEach', fn, context, self)

    var func = options.letta && typeof options.letta === 'function' ? options.letta : utils.relike
    var done = function done (err, res) {
      self.emit('afterEach', fn, err, res)
      if (err instanceof Error) {
        self.emit('error', err, fn)
        return options.settle ? next(null, err) : next(err)
      }
      next(null, res)
    }

    var args = [fn].concat(params)
    args.push(done)
    utils.then(func.apply(context, args)).then(done)
  }
}

/**
 * Expose `utils` modules
 */

module.exports = utils
