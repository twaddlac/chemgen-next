#!/usr/bin/env node

import app = require('../../../../server/server.js');
import {groupBy, isEqual, find, uniq} from 'lodash';
import Promise = require('bluebird');
import Papa = require('papaparse');
import deepcopy = require('deepcopy');
import {
  PlatePlan96ResultSet,
  RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet
} from "../../../../common/types/sdk/models";

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
        console.log('finished');
        process.exit(0);
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
        eegiResult.screenStage = 'permissive';
        eegiResult.screenName = `RNAi Ahringer Secondary ${eegiResult["wormstrain.genotype"]} Permissive Screen`;
        name = `${name} Permissive Screen`;
        eegiResult.name = name;
      } else {
        eegiResult.screenStage = 'restrictive';
        eegiResult.screenName = `RNAi Ahringer Secondary ${eegiResult["wormstrain.genotype"]} Restrictive Screen`;
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

function extractPlates(groupedResults: any) {
  return new Promise((resolve, reject) => {
    Promise.map(Object.keys(groupedResults), (group: string) => {
      let wormStrain = Object.keys(groupedResults[group])[0];
      let plates = Object.keys(groupedResults[group][wormStrain]);
      let plate = groupedResults[group][wormStrain][plates[0]];
      return createPlatePlan(plate, group)
    })
      .then((platePlans: PlatePlan96ResultSet[]) => {
        resolve(platePlans);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
}

function createPlatePlan(plate: Array<EegiResults>, group: string) {
  let geneNames = plate.map((well) => {
    return  well['clone.id'].replace('sjj_', '');
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
            platePlan.platePlanName = group;
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
  "_id": "5af2d6b191f1d80107d9689d",
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
