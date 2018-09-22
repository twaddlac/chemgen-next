'use strict'

const app = require('../../../../../server/server')
const Plate = app.models.Plate
let assert = require('assert')
const Promise = require('bluebird')

const shared = require('../../../../../test/shared');
shared.makeMemoryDb()

const data = [{
  'csPlateid': 9281,
  'id': 'cx5-pc171218150005',
  'name': 'RNAiI.3A1E',
  'description': null,
  'statusid': 70,
  'logstat': 10,
  'creator': 'cell',
  'creationdate': '2017-12-18T00:00:00.000Z',
  'creationtime': '1899-12-30T15:56:26.000Z',
  'protocolid': 742,
  'detaildatapath': 'UNCShare',
  'imagepath': '\\\\aduae120-wap\\CS_DATA_SHARE\\2017Dec18\\cx5-pc171218150005\\',
  'platestarttime': '2017-12-18T15:56:26.000Z',
  'platefinishtime': '2017-12-18T15:58:22.000Z',
  'protocoldata': null,
  'wellcount': 96,
  'wfieldcount': 96,
  'fimagecount': 96,
  'cellcount': 0,
  'scanid': 'RNAiI.3A1E',
  'zsystemlistid': 'cx5-pc',
  'logtype': 100,
  'platestackid': null,
  'savemodeid': null,
  'instrumentid': null,
  'runid': null,
  'platebarcode': 'RNAII.3A1E',
  'stackid': null,
  'intervalcount': 1,
  'formfactordata': '8;12;C;96 Well CX5',
  'paId': null,
  'paVersion': null,
  'parentId': null,
  'auxSource': null,
  'owner': null,
  'siloId': 14,
  'guid': '673DD534-9128-4E29-91EE-61F707A4F879'
},
  {
    'csPlateid': 9282,
    'id': 'cx5-pc171218160001',
    'name': 'RNAiI.3A1E_D',
    'description': null,
    'statusid': 70,
    'logstat': 10,
    'creator': 'cell',
    'creationdate': '2017-12-18T00:00:00.000Z',
    'creationtime': '1899-12-30T16:03:28.000Z',
    'protocolid': 742,
    'detaildatapath': 'UNCShare',
    'imagepath': '\\\\aduae120-wap\\CS_DATA_SHARE\\2017Dec18\\cx5-pc171218160001\\',
    'platestarttime': '2017-12-18T16:03:28.000Z',
    'platefinishtime': '2017-12-18T16:05:24.000Z',
    'protocoldata': null,
    'wellcount': 96,
    'wfieldcount': 96,
    'fimagecount': 96,
    'cellcount': 0,
    'scanid': 'RNAiI.3A1E_D',
    'zsystemlistid': 'cx5-pc',
    'logtype': 100,
    'platestackid': null,
    'savemodeid': null,
    'instrumentid': null,
    'runid': null,
    'platebarcode': 'RNAII.3A1E_D',
    'stackid': null,
    'intervalcount': 1,
    'formfactordata': '8;12;C;96 Well CX5',
    'paId': null,
    'paVersion': null,
    'parentId': null,
    'auxSource': null,
    'owner': null,
    'siloId': 14,
    'guid': 'E4DFD22D-56CA-48E7-B19D-559B30C08AE8'
  },
  {
    'csPlateid': 9283,
    'id': 'cx5-pc171218160002',
    'name': 'RNAiI.3A1E_M',
    'description': null,
    'statusid': 70,
    'logstat': 10,
    'creator': 'cell',
    'creationdate': '2017-12-18T00:00:00.000Z',
    'creationtime': '1899-12-30T16:09:05.000Z',
    'protocolid': 742,
    'detaildatapath': 'UNCShare',
    'imagepath': '\\\\aduae120-wap\\CS_DATA_SHARE\\2017Dec18\\cx5-pc171218160002\\',
    'platestarttime': '2017-12-18T16:09:05.000Z',
    'platefinishtime': '2017-12-18T16:11:00.000Z',
    'protocoldata': null,
    'wellcount': 96,
    'wfieldcount': 96,
    'fimagecount': 96,
    'cellcount': 0,
    'scanid': 'RNAiI.3A1E_M',
    'zsystemlistid': 'cx5-pc',
    'logtype': 100,
    'platestackid': null,
    'savemodeid': null,
    'instrumentid': null,
    'runid': null,
    'platebarcode': 'RNAII.3A1E_M',
    'stackid': null,
    'intervalcount': 1,
    'formfactordata': '8;12;C;96 Well CX5',
    'paId': null,
    'paVersion': null,
    'parentId': null,
    'auxSource': null,
    'owner': null,
    'siloId': 14,
    'guid': '2D5454DB-4692-46D9-A372-A8115D4E5DB2'
  },
  {
    'csPlateid': 9284,
    'id': 'cx5-pc171218160003',
    'name': 'RNAiI.3A1E_D_M',
    'description': null,
    'statusid': 70,
    'logstat': 10,
    'creator': 'cell',
    'creationdate': '2017-12-18T00:00:00.000Z',
    'creationtime': '1899-12-30T16:15:49.000Z',
    'protocolid': 742,
    'detaildatapath': 'UNCShare',
    'imagepath': '\\\\aduae120-wap\\CS_DATA_SHARE\\2017Dec18\\cx5-pc171218160003\\',
    'platestarttime': '2017-12-18T16:15:49.000Z',
    'platefinishtime': '2017-12-18T16:17:45.000Z',
    'protocoldata': null,
    'wellcount': 96,
    'wfieldcount': 96,
    'fimagecount': 96,
    'cellcount': 0,
    'scanid': 'RNAiI.3A1E_D_M',
    'zsystemlistid': 'cx5-pc',
    'logtype': 100,
    'platestackid': null,
    'savemodeid': null,
    'instrumentid': null,
    'runid': null,
    'platebarcode': 'RNAII.3A1E_D_M',
    'stackid': null,
    'intervalcount': 1,
    'formfactordata': '8;12;C;96 Well CX5',
    'paId': null,
    'paVersion': null,
    'parentId': null,
    'auxSource': null,
    'owner': null,
    'siloId': 14,
    'guid': 'A9528FCE-4C47-42F3-B51F-D79E94A27C7D'
  }]

describe('Plate ExpSetSearch', function () {
  before(function (done) {
    Promise.map(data, function (row) {
      return Plate.create(row)
    })
      .then((results) => {
        done()
      })
      .catch((error) => {
        done(new Error(error))
      })
  })
  it('Should only find plates from the in memory db', function (done) {
    Plate.find()
      .then((results) => {
        assert.deepEqual(results.length, 4)
        done()
      })
      .catch((error) => {
        done(new Error(error))
      })
  })
  shared.sharedAfter()
})
