#!/usr/bin/env node

import app = require('../../../../server/server.js');
import {groupBy, uniqBy, isEqual, find, get, uniq} from 'lodash';
import Promise = require('bluebird');
import Papa = require('papaparse');
import deepcopy = require('deepcopy');
import {
  ExpBiosampleResultSet, ExpScreenResultSet,
  PlatePlan96ResultSet,
  RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet
} from "../../../../common/types/sdk/models";
import {ExpScreenUploadWorkflowResultSet} from "../../../../../chemgen-next-client/src/sdk/models";

const path = require('path');
const fs = require('fs');

let file = 'eegi-denorm-2012-01-18.csv';
// let file = 'eegi_ny_db_denorm_2012-01-18_A01.csv';
let eegi = path.resolve(__dirname, file);
let wormStrains = path.resolve(__dirname, 'worm_strain_table_ny.csv');

// Image urls look like this - http://eegi.bio.nyu.edu/image/32412/Tile000006.bmp
// eegi.bio.nyu.edu/${plateId}/tileMappingWell.bmp

parseCSVFile(eegi)
  .then((eegiResults: EegiResults[]) => {
    const groupedResults: any = createExpGroups(eegiResults);
    return extractPlates(groupedResults)
      .then((platePlans: PlatePlan96ResultSet[]) => {
        return createScreens(groupedResults)
          .then((screens: ExpScreenResultSet[]) =>{
            screens = uniqBy(screens, 'screenName');
            return createBiosamples(groupedResults)
              .then((biosamples: ExpBiosampleResultSet[]) =>{
                return createExpScreenWorkflows(groupedResults, screens, biosamples, platePlans);
              })
              .then((results: ExpScreenUploadWorkflowResultSet[]) =>{
                return app.models.ExpScreenUploadWorkflow.load.workflows.worms.doWork(results[0])
                  .then(() => {
                    return;
                  })
                  .catch((error) => {
                    return(new Error(error));
                  });

              })
              .catch((error) =>{
                return(new Error(error));
              })
          })
          .catch((error) =>{
            return new Error(error);
          })

        // console.log('finished');
        // process.exit(0);
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
        process.exit(1);
      });
  })
  .catch((error) => {
    console.log(`Error: ${error}`);
    process.exit(1);
  });

function parseCSVFile(csvFile) {
  return new Promise((resolve, reject) => {
    Papa.parse(fs.createReadStream(csvFile), {
      header: true,
      complete: function (results) {
        resolve(results.data);
      },
    });
  });
}

/**
 * First create an arbitrary group from the experiment date, temperature and library_stock (minus the well),
 * From within that group create groupings of worm strains
 * From within that group groupings of plate IDs
 * @param eegiResults
 */
function createExpGroups(eegiResults: EegiResults[]) {
  eegiResults.map((eegiResult: EegiResults) => {
    const libraryStock = eegiResult['experiment.library_stock_id'].replace(/_.*$/, '');
    const barcode = `RNAi--${eegiResult['experimentplate.date']}--${eegiResult['experimentplate.temperature']}--${eegiResult['experiment.worm_strain_id']}--${libraryStock}--${eegiResult["experiment.plate_id"]}`;
    let name = `RNAi Ahringer ${eegiResult['experimentplate.date']} ${eegiResult['experimentplate.temperature']} ${eegiResult['experiment.worm_strain_id']} ${libraryStock}`;
    const group = `RNAi--${eegiResult['experimentplate.date']}--${eegiResult['experimentplate.temperature']}--${libraryStock}`;
    if (!isEqual(eegiResult["experiment.worm_strain_id"], 'N2')) {
      if (isEqual(eegiResult["experimentplate.temperature"], eegiResult['wormstrain.permissive_temperature'])) {
        eegiResult.screenType = 'permissive';
        eegiResult.screenStage = 'secondary';
        eegiResult.screenName = `NY RNAi Ahringer Secondary ${eegiResult["wormstrain.genotype"]} Permissive Screen`;
        name = `${name} Permissive Screen`;
        eegiResult.name = name;
      } else {
        eegiResult.screenType = 'restrictive';
        eegiResult.screenStage = 'secondary';
        eegiResult.screenName = `NY RNAi Ahringer Secondary ${eegiResult["wormstrain.genotype"]} Restrictive Screen`;
        name = `${name} Permissive Screen`;
        eegiResult.name = name;
      }
    }
    eegiResult.barcode = barcode;
    eegiResult.group = group;
  });

  let groupedResults: any = groupBy(eegiResults, 'group');
  Object.keys(groupedResults).map((group: string) => {
    let t: any = groupBy(groupedResults[group], 'experiment.worm_strain_id');
    Object.keys(t).map((wormStrain: string) => {
      let tt = groupBy(t[wormStrain], 'experiment.plate_id');
      Object.keys(tt).map((plateId: number) => {
        if (!find(tt[plateId], {'clone.library': 'Ahringer'})) {
          delete tt[plateId];
        }
      });

      //Check to ensure that all have the same plateplan
      const allPlateCloneIds = Object.keys(tt).map((plateId: number) => {
        return tt[plateId].map((eegiResult) => {
          return eegiResult['clone.id'];
        });
      });

      // For secondary screens plate plans need to be the same
      // If they aren't need to figure out which ones are different
      // And probably manually change it
      allPlateCloneIds.map((aOnePlateCloneIds: Array<string>) => {
        allPlateCloneIds.map((bOnePlateCloneIds: Array<string>) => {
          if (!isEqual(aOnePlateCloneIds, bOnePlateCloneIds)) {
            throw new Error(`plate plans for ${group} are not equal and must be equal for secondary screens!`);
          }
        });
      });

      t[wormStrain] = tt;
    });
    groupedResults[group] = t;
  });
  return groupedResults;
}

/**
 * Create the screens
 *   {
    "screenId": 0,
    "screenName": "string",
    "screenType": "string",
    "screenStage": "string",
    "screenDescription": "string",
    "screenProtocol": "string",
    "screenParentId": 0,
    "screenPerformedBy": "string",
    "screenMeta": "string"
  }
 * @param groupedResults
 */
function createScreens(groupedResults: any) {
  let createScreens: ExpScreenResultSet[] = [];
  return new Promise((resolve, reject) => {

    Object.keys(groupedResults).map((group) => {
      Object.keys(groupedResults[group]).map((wormStrain) => {
        let plateR1Key = Object.keys(groupedResults[group][wormStrain])[0];
        let plateR1: EegiResults = groupedResults[group][wormStrain][plateR1Key][0];
        if (!find(createScreens, {screeName: plateR1['screenName']})) {
          let screen: ExpScreenResultSet = new ExpScreenResultSet({
            screenName: plateR1.screenName,
            screenStage: plateR1.screenStage,
            screenType: plateR1.screenType,
          });
          createScreens.push(screen);
        }
      });
    });

    // @ts-ignore
    Promise.map(createScreens, (screen: ExpScreenResultSet) => {
      return app.models.ExpScreen
        .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(screen)}, screen)
        .then((results) => {
          return results[0];
        })
        .catch((error) => {
          return new Error(error);
        })
    })
      .then((results: ExpScreenResultSet[]) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });

  });
}


/**
 * Create the biosamples
 * {
    "biosampleId": 0,
    "biosampleName": "string",
    "biosampleType": "string",
    "biosampleSpecies": "string",
    "biosampleStrain": "string",
    "biosampleGene": "string",
    "biosampleAllele": "string",
    "biosampleMeta": "string"
  }
 * @param groupedResults
 */
function createBiosamples(groupedResults: any) {
  let createThese: ExpBiosampleResultSet[] = [];

  Object.keys(groupedResults).map((group) => {
    Object.keys(groupedResults[group]).map((wormStrain) => {
      let plateR1Key = Object.keys(groupedResults[group][wormStrain])[0];
      let plateR1 = groupedResults[group][wormStrain][plateR1Key][0];
      if (!find(createThese, {biosampleGene: plateR1['wormstrain.gene']})) {
        let biosample: ExpBiosampleResultSet = new ExpBiosampleResultSet({
          biosampleType: 'worm',
          biosampleAllele: plateR1['wormstrain.allele'],
          biosampleGene: plateR1['wormstrain.gene'],
          biosampleStrain: plateR1['wormstrain.id'],
          biosampleName: plateR1['wormstrain.allele'] || 'N2',
          biosampleMeta: JSON.stringify({
            allele: plateR1['wormstrain.allele'],
            gene: plateR1['wormstrain.gene'],
            id: plateR1['wormstrain.id'],
            permissiveTemp: plateR1['wormstrain.permissive_temperature'],
            restrictiveTemp: plateR1['wormstrain.restrictive_temperature'],
            genotype: plateR1['wormstrain.genotype'],
          }),
        });
        createThese.push(biosample);
      }
    });
  });

  return new Promise((resolve, reject) => {
    // @ts-ignore
    Promise.map(createThese, (biosample: ExpBiosampleResultSet) => {
      return app.models.ExpBiosample
        .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(biosample)}, biosample)
        .then((results) => {
          return results[0];
        })
        .catch((error) => {
          return new Error(error);
        });
    })
      .then((results: ExpBiosampleResultSet[]) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

/**
 * {
 *     RNAi--2012-01-18--22.5--universal-F2: {
 *         AR1: {
 *             Replicate1: [wells],
 *             Replicate2: [wells]
 *             Replicate3: [wells],
 *             Replicate4: [wells]
 *         },
 *         EU856: {
 *             Replicate1: [wells],
 *             Replicate2: [wells]
 *             Replicate3: [wells],
 *             Replicate4: [wells]
 *         },
 *         N2: {
 *             Replicate1: [wells],
 *             Replicate2: [wells]
 *         }
 *     }
 * }
 * @param groupedResults
 * @param screens
 * @param biosamples
 */
function createExpScreenWorkflows(groupedResults: any, screens: ExpScreenResultSet[], biosamples: ExpBiosampleResultSet[], platePlans: PlatePlan96ResultSet[]) {
  let workflows: ExpScreenUploadWorkflowResultSet[] = [];
  Object.keys(groupedResults).map((group: string) => {
    //Top Level is the Experiment Group Key
    let N2: any = null;
    if (get(groupedResults[group], 'N2')) {
      N2 = deepcopy(groupedResults[group].N2);
      delete groupedResults[group].N2;
    }

    Object.keys(groupedResults[group]).map((mutantWormStrain: string) => {
      let plateR1 = Object.keys(groupedResults[group][mutantWormStrain])[0];
      let firstWell: EegiResults = groupedResults[group][mutantWormStrain][plateR1][0];
      let wormRecord = find(biosamples, {biosampleGene: firstWell['wormstrain.gene']});
      let screenRecord = find(screens, {screenName: firstWell.screenName});
      let platePlan = find(platePlans, {platePlanName: `NY ${group}`});

      let thisWorkflow: ExpScreenUploadWorkflowResultSet = deepcopy(minimalWorkflow);
      thisWorkflow['site'] = 'NY';
      thisWorkflow.name = firstWell.name;
      thisWorkflow.screenName = firstWell.screenName;
      thisWorkflow.screenStage = firstWell.screenStage;
      thisWorkflow.screenType = firstWell.screenType;
      thisWorkflow.temperature = firstWell['experimentplate.temperature'];
      thisWorkflow.screenId = screenRecord.screenId;
      thisWorkflow.instrumentId = 3;
      thisWorkflow.libraryId = 1;
      thisWorkflow.librarycode = 'ahringer2';
      thisWorkflow.assayViewType = "exp_assay_ahringer2";
      thisWorkflow.plateViewType = "exp_plate_ahringer2";
      thisWorkflow.biosamples = {
        "experimentBiosample": {
          "id": wormRecord.biosampleId,
          "name": wormRecord.biosampleGene
        }, "ctrlBiosample": {"id": "4", "name": "N2"}
      };


      // Add Plates
      thisWorkflow.experimentGroups = {};
      thisWorkflow.experimentGroups.treat_rnai = {};
      thisWorkflow.experimentGroups.treat_rnai.plates = [];
      thisWorkflow.experimentGroups.treat_rnai.biosampleId = wormRecord.biosampleId;

      Object.keys(groupedResults[group][mutantWormStrain]).map((plateId: number) => {
        let plate: EegiResults = groupedResults[group][mutantWormStrain][plateId][0];
        let plateRecord: any = {
          "csPlateid": plate["experiment.plate_id"],
          "id": plate["experiment.plate_id"],
          "name": plate.barcode,
          "creationdate": plate["experimentplate.date"],
          imagepath: plate['experiment.plate_id'],
          "platebarcode": plate.barcode,
          "instrumentPlateId": plate['experiment.plate_id']
        };
        thisWorkflow.experimentGroups.treat_rnai.plates.push(plateRecord);
      });

      thisWorkflow.experimentGroups.ctrl_rnai = {};
      thisWorkflow.experimentGroups.ctrl_rnai.plates = [];
      thisWorkflow.experimentGroups.ctrl_rnai.biosampleId = 4;

      if(N2){
        Object.keys(N2).map((plateId: number) =>{
          let plate : EegiResults = N2[plateId][0];
          let plateRecord: any = {
            "csPlateid": plate["experiment.plate_id"],
            "id": plate["experiment.plate_id"],
            "name": plate.barcode,
            "creationdate": plate["experimentplate.date"],
            imagepath: plate['experiment.plate_id'],
            "platebarcode": plate.barcode,
            "instrumentPlateId": plate['experiment.plate_id']
          };
          thisWorkflow.experimentGroups.ctrl_rnai.plates.push(plateRecord);
        });
      }

      thisWorkflow.replicates = [];
      thisWorkflow.experimentGroups.treat_rnai.plates.map((plate) =>{
        thisWorkflow.replicates.push([plate.id]);
      });
      thisWorkflow.experimentGroups.ctrl_rnai.plates.map((plate, index) =>{
        if(index < thisWorkflow.experimentGroups.treat_rnai.plates.length){
          thisWorkflow.replicates[index].push(plate.id);
        }else{
          thisWorkflow.replicates[this.workflow.replicates.length - 1].push(plate.id);
        }
      });
      thisWorkflow.platePlanId = String(platePlan.id);
      thisWorkflow.platePlan = platePlan;
      thisWorkflow.instrumentLookUp = 'nyMicroscope';

      workflows.push(thisWorkflow);

    });
  });
  return new Promise((resolve, reject) =>{
    //@ts-ignore
    Promise.map(workflows,(workflow: ExpScreenUploadWorkflowResultSet) =>{
      return app.models.ExpScreenUploadWorkflow
        .findOrCreate({where: {name: workflow.name}}, workflow)
        .then((results) =>{
          results[0].platePlanId = workflow.platePlanId;
          results[0].instrumentLookUp = workflow.instrumentLookUp;
          return app.models.ExpScreenUploadWorkflow.upsert(results[0]);
          // return results[0];
        })
        .catch((error) =>{
          return new Error(error);
        })
    })
      .then((results: ExpScreenUploadWorkflowResultSet[]) =>{
        resolve(results);
      })
      .catch((error) =>{
        reject(new Error(error));
      })
  });
}

function extractPlates(groupedResults: any) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    Promise.map(Object.keys(groupedResults), (group: string) => {
      let wormStrain = Object.keys(groupedResults[group])[0];
      let plates = Object.keys(groupedResults[group][wormStrain]);
      let plate = groupedResults[group][wormStrain][plates[0]];
      return createPlatePlan(plate, group)
    })
      .then((platePlans: PlatePlan96ResultSet[]) => {
        return createPlatePlans(platePlans);
      })
      .then((platePlans: PlatePlan96ResultSet[]) =>{
        resolve(platePlans);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function createPlatePlan(plate: Array<EegiResults>, group: string) {
  let geneNames = plate.map((well) => {
    return well['clone.id'].replace('sjj_', '');
  });
  let platePlan: PlatePlan96ResultSet = new PlatePlan96ResultSet();
  return new Promise((resolve, reject) => {
    app.models.RnaiLibrary
      .find({
        where: {
          and: [
            {
              geneName: {
                inq: geneNames,
              }
            },
            {
              plate: {
                nlike: 'S%',
              },
            }
          ]
        }
      })
      .then((rnaiLibaryResults: RnaiLibraryResultSet[]) => {
        return app.models.RnaiWormbaseXrefs
          .find({
            where: {
              wbGeneSequenceId: {
                inq: rnaiLibaryResults.map((rnaiLibraryResult) => {
                  return rnaiLibraryResult.geneName;
                })
              },
            }
          })
          .then((rnaiXrefs: RnaiWormbaseXrefsResultSet[]) => {
            //JOIN
            plate.map((eegiResult: EegiResults) => {
              platePlan[eegiResult['experiment.well']] = {};
              if (isEqual(eegiResult['clone.id'], 'L4440')) {
                //Its an L4440 Well
                platePlan[eegiResult['experiment.well']] = {
                  "isValid": true,
                  "well": eegiResult['experiment.well'],
                  "taxTerm": "L4440",
                  "geneName": "L4440",
                  "lookUp": "L4440",
                  "geneData": {}
                };
              } else {
                // Theres a gene
                let rnaiResult = find(rnaiLibaryResults, {'geneName': eegiResult['clone.id'].replace('sjj_', '')});
                if (rnaiResult) {
                  let rnaiXref = find(rnaiXrefs, {wbGeneSequenceId: String(rnaiResult.geneName)});
                  platePlan[eegiResult['experiment.well']] = {
                    "isValid": true,
                    "well": eegiResult['experiment.well'],
                    "taxTerm": eegiResult['clone.id'].replace('sjj_', ''),
                    "geneName": eegiResult['clone.id'].replace('sjj_', ''),
                    "lookUp": rnaiResult.bioloc,
                    "geneData": rnaiXref,
                    "parentLibrary": rnaiResult,
                  };
                } else {
                  // Its an empty well
                  platePlan[eegiResult['experiment.well']] = {
                    "isValid": true,
                    "well": eegiResult['experiment.well'],
                    geneData: {},
                  };
                }
              }
            });
            // @ts-ignore
            platePlan.platePlanUploadDate = new Date();
            platePlan.platePlanName = `NY ${group}`;
            platePlan.site = 'NY';
            return platePlan;
          })
          .catch((error) => {
            return new Error(error);
          })
      })
      .then((platePlan) => {
        resolve(platePlan);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function createPlatePlans(platePlans: PlatePlan96ResultSet[]){
  return new Promise((resolve, reject) =>{
    //@ts-ignore
    Promise.map(platePlans, (platePlan) =>{
      return app.models.PlatePlan96
        .findOrCreate({where: {platePlanName: platePlan.platePlanName}}, platePlan)
        .then((results) =>{
          return results[0];
        })
        .catch((error) =>{
          return new Error(error);
        })
    })
      .then((results: PlatePlan96ResultSet[]) =>{
        resolve(results);
      })
      .catch((error) =>{
        reject(new Error(error));
      });
  });
}

declare var Object: any;

export interface WormStrainsInterface {
  id: string;
  gene: string;
  genotype?: string;
  permissive_temperature?: number;
  restrictive_temperature?: number;
}

export class WormStrains implements WormStrainsInterface {
  id: string;
  gene: string;
  genotype?: string;
  permissive_temperature?: number;
  restrictive_temperature?: number;

  constructor(data?: WormStrainsInterface) {
    Object.assign(this, data);
  }
}

export interface EegiResultsInterface {
  'experiment.worm_strain_id': string;
  'experimentplate.temperature': string;
  'experimentplate.date': string;
  'experiment.library_stock_id': string;
  'experiment.well': string;
  'wormstrain.permissive_temperature': string;
  'wormstrain.restrictive_temperature': string;
  barcode?: string;
  group?: string;
  screenStage?: string;
  screenType?: string;
  screenName?: string;
  'wormstrain.allele'?: string;
  'wormstrain.gene'?: string;
  'wormstrain.id'?: string;
  'wormstrain.genotype'?: string;
  'experiment.plate_id'?: string;
  'experimentplate.well'?: string;
  name?: string;
}

export class EegiResults implements EegiResultsInterface {
  'experiment.worm_strain_id': string;
  'experimentplate.temperature': string;
  'experimentplate.date': string;
  'experiment.library_stock_id': string;
  'experiment.well': string;
  'wormstrain.permissive_temperature': string;
  'wormstrain.restrictive_temperature': string;
  barcode ?: string;
  group ?: string;
  screenStage ?: string;
  screenType?: string;
  screenName ?: string;
  name ?: string;
  'wormstrain.allele'?: string;
  'wormstrain.gene'?: string;
  'wormstrain.id'?: string;
  'wormstrain.genotype'?: string;
  'experiment.plate_id'?: string;
  'experimentplate.well'?: string;

  constructor(data?: EegiResultsInterface) {
    Object.assign(this, data);
  }
}

let minimalWorkflow = {
  "name": "AHR2 2018-04 mip-1;mip-2 Restrictive 25",
  "comment": "reupload",
  platePlan: {},
  "platePlanId": "5af2d2db91f1d80107d9689b",
  "assayViewType": "exp_assay_ahringer2",
  "plateViewType": "exp_plate_ahringer2",
  "instrumentPlateIdLookup": "csPlateid",
  "wells": ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "A11", "A12", "B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12", "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12", "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G12", "H01", "H02", "H03", "H04", "H05", "H06", "H07", "H08", "H09", "H10", "H11", "H12"],
  "screenId": 7,
  "instrumentId": 1,
  "libraryId": 1,
  "screenStage": "secondary",
  "screenType": "restrictive",
  "biosamples": {"experimentBiosample": {"id": "6", "name": "mip-1;mip-2"}, "ctrlBiosample": {"id": "4", "name": "N2"}},
  "libraryModel": "RnaiLibrary",
  "libraryStockModel": "RnaiLibraryStock",
  "reagentLookUp": "rnaiId",
  "instrumentLookUp": "arrayScan",
  "biosampleType": "worm",
  "replicates": [["9807", "9799"], ["9808", "9800"], ["9809", "9801"], ["9810", "9802"], ["9811", "9803"], ["9812", "9804"], ["9813", "9805"], ["9814", "9806"]],
  "conditions": ["treat_rnai", "ctrl_rnai", "ctrl_null", "ctrl_strain"],
  "controlConditions": ["ctrl_strain", "ctrl_null"],
  "experimentConditions": ["treat_rnai", "ctrl_rnai"],
  "biosampleMatchConditions": {"treat_rnai": "ctrl_strain", "ctrl_rnai": "ctrl_null"},
  "experimentMatchConditions": {"treat_rnai": "ctrl_rnai"},
  "experimentDesign": {"treat_rnai": ["ctrl_rnai", "ctrl_strain", "ctrl_null"]},
  "experimentGroups": {
    "treat_rnai": {
      "plates": [{
        "csPlateid": "9814",
        "id": "cx5-pc180429150006",
        "name": "RNAi_Rescreen_Apr_mip_25_8",
        "creationdate": "2018-04-29T00:00:00.000Z",
        "imagepath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2018Apr23\\cx5-pc180429150006\\",
        "platebarcode": "CX5-PC15:28:46",
        "instrumentPlateId": 9814
      }], "biosampleId": "6"
    },
    "ctrl_rnai": {
      "plates": [{
        "csPlateid": "9806",
        "id": "cx5-pc180429140008",
        "name": "RNAi_Rescreen_Apr_N2_25_8",
        "creationdate": "2018-04-29T00:00:00.000Z",
        "imagepath": "\\\\aduae120-wap\\CS_DATA_SHARE\\2018Apr23\\cx5-pc180429140008\\",
        "platebarcode": "CX5-PC14:44:38",
        "instrumentPlateId": 9806
      }], "biosampleId": "4"
    },
    "ctrl_strain": {"biosampleId": "6", "plates": []},
    "ctrl_null": {"biosampleId": "4", "plates": []}
  },
  "temperature": 25,
  "librarycode": "ahringer2",
  "screenName": "mip-1;mip-2 Secondary RNAi Restrictive Screen"
};
