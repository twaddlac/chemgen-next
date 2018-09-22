'use strict'

const loopback = require('loopback')
const app = require('../../../../server/server')
const ExpPlate = app.models.ExpPlate
const assert = require('assert')

const shared = require('../../../../test/shared');
shared.makeMemoryDb();

describe('Assign Workflow Defs', function () {
  it('should return an object key workflows', function () {
    assert.deepEqual(ExpPlate.load.hasOwnProperty('workflows'), true)
    assert.deepEqual(ExpPlate.extract.hasOwnProperty('workflows'), true)
    assert.deepEqual(ExpPlate.transform.hasOwnProperty('workflows'), true)
  })
  shared.sharedAfter();
})
