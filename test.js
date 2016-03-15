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
var async = require('async')

test('should async.mapSeries be settled', function (done) {
  var iterator = base.makeIterator({settle: true})
  async.mapSeries([
    function one () {
      return 1
    },
    function two () {
      throw new Error('two err')
      return 2 // eslint-disable-line
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
