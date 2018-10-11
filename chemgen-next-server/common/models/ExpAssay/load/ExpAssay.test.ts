import {ExpAssayResultSet, ExpPlateResultSet} from "../../../types/sdk/models";
import {PlateCollection} from "../../../types/custom/wellData";
import {WorkflowModel} from "../../index";

import assert = require('assert');
import loopback = require('loopback');
import app = require('../../../../server/server');
import Promise = require('bluebird');
import {orderBy} from 'lodash';

const ExpAssay = app.models.ExpAssay as (typeof WorkflowModel);
// const ExpPlate = app.models.ExpPlate as (typeof WorkflowModel);
// const ExpGroup = app.models.ExpGroup as (typeof WorkflowModel);
const RnaiLibrary = app.models.RnaiLibrary as (typeof WorkflowModel);

import shared = require('../../../../test/shared');
shared.makeMemoryDb();

const rnaiLibraries = require('../../../../test/data/rnai_library.json');

//TODO This is not a great ExpPlates set
//@ts-ignore
const expPlates: ExpPlateResultSet[] = [
  {
    "plateId": 1,
    "screenId": 1,
    "plateImagePath": "2017Dec18/9281",
    "barcode": "RNAiI.3A1E",
    "instrumentId": 1,
    "instrumentPlateId": 9281,
    "plateImageDate": "2017-12-18T15:56:26.000Z",
    //@ts-ignore
    "plateStartTime": "2017-12-18T15:56:26.000Z",
    "plateCreationDate": "2017-12-18T00:00:00.000Z",
    "instrumentPlateImagePath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2017Dec18\\cx5-pc171218150005\\",
  },
  {
    "plateId": 2,
    "screenId": 1,
    "plateImagePath": "2017Dec18/9282",
    "barcode": "L4440E",
    "instrumentId": 1,
    "instrumentPlateId": 9282,
    "plateImageDate": "2017-12-18T15:56:26.000Z",
    "plateStartTime": "2017-12-18T15:56:26.000Z",
    "plateCreationDate": "2017-12-18T00:00:00.000Z",
    "instrumentPlateImagePath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2017Dec18\\cx5-pc171218150005\\",
  },
  {
    "plateId": 3,
    "screenId": 1,
    "plateImagePath": "2017Dec18/9283",
    "barcode": "RNAiI.3A1E_M",
    "instrumentId": 1,
    "instrumentPlateId": 9283,
    "instrumentPlateImagePath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2017Dec18\\cx5-pc171218150005\\",
    "plateImageDate": "2017-12-18T15:56:26.000Z",
    "plateStartTime": "2017-12-18T15:56:26.000Z",
    "plateCreationDate": "2017-12-18T00:00:00.000Z"
  },
  {
    "plateId": 4,
    "screenId": 1,
    "plateImagePath": "2017Dec18/9284",
    "barcode": "L4440E_M",
    "instrumentId": 1,
    "instrumentPlateId": 9284,
    "instrumentPlateImagePath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2017Dec18\\cx5-pc171218150005\\",
    "plateImageDate": "2017-12-18T15:56:26.000Z",
    "plateStartTime": "2017-12-18T15:56:26.000Z",
    "plateCreationDate": "2017-12-18T00:00:00.000Z"
  },
  {
    "plateId": 1,
    "screenId": 1,
    "plateImagePath": "2017Dec18/9285",
    "barcode": "RNAiI.3A1E_D",
    "instrumentId": 1,
    "instrumentPlateId": 9285,
    "instrumentPlateImagePath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2017Dec18\\cx5-pc171218150005\\",
    "plateImageDate": "2017-12-18T15:56:26.000Z",
    "plateStartTime": "2017-12-18T15:56:26.000Z",
    "plateCreationDate": "2017-12-18T00:00:00.000Z"
  },
];

//This would actually be gotten in from the interface, which means we will use the instrumentPlateId as the identifier
//Ths only works for the primary screen
//For the secondary we need a well by well plate plan
//TODO Think of better name - ExpScreenUploadWorkflow or something
//This is a dummy workflow, so I am giving it an ID
const workflowData = {
  id: 1,
  wells: ['A01', 'A02', 'A03', 'A12'],
  screenId: 1,
  instrumentId: 1,
  libraryId: 1,
  librarycode: 'ahringer2',
  screenName: 'mel-28 Primary RNAi Enhancer Screen',
  assayViewType: 'exp_assay_ahringer2',
  temperature: '25.5C',
  screenStage: 'primary',
  screenType: 'permissive',
  //TODO Update this to have the name the ID
  biosamples: {expBiosample: {name: 'mel-28', id: 1}, ctrlBiosample: {name: 'N2', id: 2}},
  libraryModel: 'RnaiLibrary',
  libraryStockModel: 'RnaiLibraryStock',
  reagentLookUp: 'rnaiId',
  instrumentLookUp: 'arrayScan',
  biosampleType: 'worm',
  stockPrepDate: new Date(),
  search: {rnaiLibrary: {plate: '3', chrom: 'I'}},
  replicates: {
    1: [9281, 9282, 9283, 9284],
    2: [9285],
  },
  experimentGroups: {
    treat_rnai: {biosampleId: 1, plates: [expPlates[2]]},
    ctrl_rnai: {biosampleId: 1, plates: [expPlates[0], expPlates[4]]},
    ctrl_strain: {biosampleId: 2, plates: [expPlates[3]]},
    ctrl_null: {biosampleId: 2, plates: [expPlates[1]]},
  },
  //These are all just static definitions, but it is nice to have them in here
  conditions: ['treat_rnai', 'ctrl_rnai', 'ctrl_null', 'ctrl_strain'],
  controlConditions: ['ctrl_strain', 'ctrl_null'],
  biosampleControlConditions: {
    'treat_rnai': 'ctrl_strain',
    'ctrl_rnai': 'ctrl_null',
  },
  experimentDesign: {treat_rnai: ['ctrl_rnai', 'ctrl_strain', 'ctrl_null']},
};

describe('ExpAssay.load', function () {
  shared.prepareRnai();

  it('Should return the correct biosampleId and expPlateType', function () {
    this.timeout(5000);
    let thing = ExpAssay.load.getExpGroup(workflowData, expPlates[0]);
    assert.deepEqual(thing, {expGroupType: 'ctrl_rnai', biosampleId: 1});
  });

  it('ExpAssay.load.createExpPlate expPlates[0] R1', function (done) {
    this.timeout(10000);
    ExpAssay.load.workflows.processExpPlate(workflowData, expPlates[0])
      .then((results: PlateCollection) => {
        assert.equal(results.wellDataList[0].expGroup.biosampleId, 1);
        assert.equal(results.wellDataList[0].expGroup.expGroupType, 'ctrl_rnai');
        assert.equal(results.wellDataList[0].expAssay.assayReplicateNum, 1);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });
  });
  it('ExpAssay.load.createExpPlate expPlates[4] R2', function (done) {
    this.timeout(5000);
    ExpAssay.load.workflows.processExpPlate(workflowData, expPlates[4])
      .then((results: PlateCollection) => {
        results.wellDataList = orderBy(results.wellDataList, 'well');
        assert.equal(results.wellDataList[0].expGroup.biosampleId, 1);
        assert.equal(results.wellDataList[0].expGroup.expGroupType, 'ctrl_rnai');
        assert.equal(results.wellDataList[0].expAssay.assayReplicateNum, 2);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });
  });
  it('ExpAssay.load.workflows.prepareAnnotationData', function (done) {
    this.timeout(5000);
    ExpAssay.load.workflows.processExpPlate(workflowData, expPlates[4])
      .then((results: PlateCollection) => {
        return ExpAssay.load.prepareAnnotationData(workflowData, results);
      })
      .then((plateData: PlateCollection) => {
        assert.ok(plateData.wellDataList[0].annotationData.taxTerms.length);
        // assert.equal(plateData.wellDataList[0].annotationData.taxTerms.length, 13);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });
  });
  it('ExpAssay.load.workflows.imageConversionPipeline.arrayScan', function (done) {
    this.timeout(5000);
    ExpAssay.load.workflows.processExpPlate(workflowData, expPlates[4])
      .then((results) => {
        return ExpAssay.load.workflows.imageConversionPipeline.arrayScan(workflowData, results);
      })
      .then((results) => {
        results = orderBy(results, 'baseImage');
        assert.equal(results[0].baseImage, '/mnt/image/2017Dec18/9285/RNAiI.3A1E_D_A01');
        assert.equal(results[0].script, "convertImage-9285-RNAiI.3A1E_D_A01");
        assert.equal(results[0].hasOwnProperty('convert'), true);
        assert.equal(results.length, 4);
        done();
      })
      .catch((error) => {
        done(new Error(error));
      });
  });
  it('ExpAssay.load.workflows.processExpPlates', function(done){
    this.timeout(5000);
    ExpAssay.load.workflows.processExpPlates(workflowData, expPlates)
      .then((results: PlateCollection[]) =>{
        assert.equal(results.length, 5);
        assert.equal(results[0].hasOwnProperty('expPlate'), true);
        assert.equal(results[0].hasOwnProperty('wellDataList'), true);
        done();
      })
      .catch((error)=>{
        done(new Error(error));
      });
  });
  shared.sharedAfter();
});
