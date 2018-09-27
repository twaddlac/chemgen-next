import app = require('../../../../../../server/server.js');
import Promise = require('bluebird');
import {
  ExpPlateResultSet, ExpScreenUploadWorkflowResultSet, PlatePlan96ResultSet,
  PlateResultSet
} from "../../../../../types/sdk/models";
import {WorkflowModel} from "../../../../index";
import {PlateCollection, WellCollection, ScreenCollection} from "../../../../../types/wellData";
import jsonfile = require('jsonfile');
import {isEqual, isEmpty, get} from 'lodash';
import deepcopy = require('deepcopy');
import chalk = require('chalk');

const ExpScreenUploadWorkflow = app.models.ExpScreenUploadWorkflow as (typeof WorkflowModel);

/**
 * This workflow goes from the upload screenData to building the interfaces
 * TODO Name this something more informative
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 */
ExpScreenUploadWorkflow.load.workflows.worms.doWork = function (workflowData: ExpScreenUploadWorkflowResultSet | ExpScreenUploadWorkflowResultSet[]) {
  return new Promise((resolve, reject) => {
    if (workflowData instanceof Array) {
      // @ts-ignore
      Promise.map(workflowData, (data: ExpScreenUploadWorkflowResultSet) => {
        return ExpScreenUploadWorkflow.load.workflows.worms.processWorkflow(data);
      }, {concurrency: 1})
        .then(() => {
          resolve();
        })
        .catch((error) => {
          app.winston.error(error.stack);
          reject(new Error(error));
        });
    }
    else {
      ExpScreenUploadWorkflow.load.workflows.worms.processWorkflow(workflowData)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          app.winston.error(error.stack);
          reject(new Error(error));
        });
    }
  });
};

ExpScreenUploadWorkflow.load.getInstrumentPlates = function (workflowData: ExpScreenUploadWorkflowResultSet) {
  let instrumentPlates: PlateResultSet[] = [];
  Object.keys(workflowData.experimentGroups).map((expGroup) => {
    if (get(workflowData, ['experimentGroups', expGroup, 'plates'])) {
      workflowData.experimentGroups[expGroup].plates.map((plate: PlateResultSet) => {
        instrumentPlates.push(plate);
      });
    }
  });
  return instrumentPlates;
};

ExpScreenUploadWorkflow.load.workflows.worms.processWorkflow = function (workflowData: ExpScreenUploadWorkflowResultSet) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    console.log(chalk.magenta(`ExpScreenUploadWorkflow.doWork ${workflowData.name}`));
    console.time(`ExpScreenUploadWorkflow.doWork ${workflowData.name}`);

    let instrumentPlates = ExpScreenUploadWorkflow.load.getInstrumentPlates(workflowData);
    ExpScreenUploadWorkflow.load[workflowData.screenStage].createWorkflowInstance(workflowData)
      .then((workflowData: ExpScreenUploadWorkflowResultSet) => {
        return ExpScreenUploadWorkflow.load.workflows.worms.populateExperimentData(workflowData, instrumentPlates)
      })
      .then((screenData: ScreenCollection) => {
        //Export to file
        return ExpScreenUploadWorkflow.load.workflows.worms.createExpInterfaces(workflowData, screenData)
      })
      // .then((screenData: ScreenCollection) => {
      //   app.winston.info('RETURNING Scores');
      //   return app.models.ModelPredictedPheno.load.workflows.parseScreen(workflowData, screenData)
      // })
      .then(() => {
        // @ts-ignore
        console.log(chalk.cyan(`Time: ExpScreenUploadWorkflow.doWork ${workflowData.name}`));
        console.timeEnd(`ExpScreenUploadWorkflow.doWork ${workflowData.name}`);
        resolve();
      })
      .catch((error) => {
        app.winston.error(error.stack);
        reject(new Error(error));
      });
  });
};

/**
 * TODO Move the workflow creation to its own function
 * ExpScreenUploadWorkflow.load.workflows.worms.populateExperimentData
 * @param workflowData
 * @param {PlateResultSet[]} instrumentPlates
 */
ExpScreenUploadWorkflow.load.workflows.worms.populateExperimentData = function (workflowData: any, instrumentPlates: PlateResultSet[]) {
  return new Promise((resolve, reject) => {
    ExpScreenUploadWorkflow.load.workflows.worms.populatePlateData(workflowData, instrumentPlates)
      .then((results: PlateCollection[]) => {
        app.winston.info(`Begin: Populate ExpDesignData ${workflowData.name}`);
        return ExpScreenUploadWorkflow.load.workflows.worms.populateExpDesignData(workflowData, results);
      })
      .then((results: ScreenCollection) => {
        app.winston.info(`Complete: Populate ExpDesignData ${workflowData.name}`);
        resolve(results);
      })
      .catch((error) => {
        app.winston.error(error.stack);
        reject(new Error(error));
      });
  })
};

/**
 * For some reason when these get read in through a web request deeply nested keys have a '[' around them
 * I have no idea why this is
 * In the future I will just store the ID to the plates and then have a process that finds them, which is probably a better idea anyways
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @returns {ExpScreenUploadWorkflowResultSet}
 */
ExpScreenUploadWorkflow.load.fixPlates = function (workflowData: ExpScreenUploadWorkflowResultSet) {

  Object.keys(workflowData.experimentGroups).map((expGroup) => {
    if (get(workflowData, ['experimentGroups', expGroup, 'plates'])) {
      workflowData.experimentGroups[expGroup].plates.map((plate: PlateResultSet, index) => {
        Object.keys(plate).map((key) => {
          const origKey = key;
          key = key.replace('[', '');
          key = key.replace(']', '');
          plate[key] = deepcopy(plate[origKey]);
          plate['instrumentPlateId'] = Number(plate.csPlateid);
          if (!isEqual(key, origKey)) {
            delete plate[origKey];
          }
        });
        workflowData.experimentGroups[expGroup].plates[index] = plate;
      });
    }
    else {
      workflowData.experimentGroups[expGroup].plates = [];
    }
  });

  return workflowData;
};

/*
In the primary screen just create the workflow instance
 */
ExpScreenUploadWorkflow.load.primary.createWorkflowInstance = function (workflowData: ExpScreenUploadWorkflowResultSet) {
  return new Promise((resolve, reject) => {
    ExpScreenUploadWorkflow.load.createWorkflowInstance(workflowData)
      .then((results: ExpScreenUploadWorkflowResultSet) => {
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

/**
 * Secondary screens require a plate plan ID
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 */
ExpScreenUploadWorkflow.load.secondary.createWorkflowInstance = function (workflowData: ExpScreenUploadWorkflowResultSet) {
  return new Promise((resolve, reject) => {
    if (!get(workflowData, 'platePlanId')) {
      reject(new Error('Secondary screens must have a platePlan!'));
    } else {
      app.models.PlatePlan96.findOne({where: {'id': workflowData.platePlanId}})
        .then((platePlan: PlatePlan96ResultSet) => {
          workflowData.platePlan = platePlan;
          return ExpScreenUploadWorkflow.load.createWorkflowInstance(workflowData)
            .then((results: ExpScreenUploadWorkflowResultSet) => {
              results.platePlan = platePlan;
              return results;
            })
            .catch((error) => {
              return new Error(error);
            })
        })
        .then((results: ExpScreenUploadWorkflowResultSet) => {
          resolve(results);
        })
        .catch((error) => {
          reject(new Error(error));
        })
    }
  });
};

ExpScreenUploadWorkflow.load.createWorkflowInstance = function (workflowData: ExpScreenUploadWorkflowResultSet) {
  return new Promise((resolve, reject) => {
    workflowData = ExpScreenUploadWorkflow.load.fixPlates(workflowData);
    workflowData = JSON.parse(JSON.stringify(workflowData));
    delete workflowData.id;
    let search = app.models[workflowData.libraryModel].load[workflowData.screenStage].createWorkflowSearchObj(workflowData);
    app.models.ExpScreenUploadWorkflow
      .findOne({
        where: {name: workflowData.name},
        // where: search,
      })
      .then((results) => {
        //TODO Update the results with the current workflow
        if (!isEmpty(results)) {
          app.winston.info('ExpScreen Upload Workflow found!');
          resolve(results);
        } else {
          app.winston.info('ExpScreen Upload Workflow NOT found!');
          return ExpScreenUploadWorkflow
            .findOrCreate({
              where: search,
            }, workflowData)
            .then((results) => {
              resolve(results[0])
            })
            .catch((error) => {
              reject(new Error(error));
            })
        }
      })
      .catch((error) => {
        reject(new Error(error));
      })
  });
};

/**
 * This workflow populates:
 * 1. ExpPlate
 * 2. Gets the plate plan -> mapping of library to exp plate wells
 * 3. Creates the stock
 * 4a. Creates the experiment groups - set of experiment condition (treat_rnai,ctrl_null,ctrL_strain,ctrl_rnai)
 * 4b. Creates the experiment groups - set of experiment condition (treat_chemical,ctrl_null,ctrL_strain,ctrl_chemical)
 * 5. Creates the ExpAssays (expGroupId is inline)
 * 6. Fires off a request to the service that converts images to non proprietary and web format
 * For all plates in an ExperimentSet
 * For the primary Screen this is a single plate from a library plus its controls
 * Barcodes Replicate 1: RNAiI.3A1E_M, RNAiI.3AE, L4440E_M, L4440E
 * Barcodes Replicate 2: RNAiI.3A1E_D_M, RNAiI.3AE_D, L4440E_D_M, L4440E_D
 * A single workflow (workflowData) maps to a SINGLE Experiment Set
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {PlateResultSet[]} instrumentPlates
 */
ExpScreenUploadWorkflow.load.workflows.worms.populatePlateData = function (workflowData: ExpScreenUploadWorkflowResultSet, instrumentPlates: PlateResultSet[]) {
  app.winston.info(`Begin: Populating Plate Data ${workflowData.name}`);
  return new Promise((resolve, reject) => {
    app.models.ExpPlate.load.workflows.processInstrumentPlates(workflowData, instrumentPlates)
      .then((expPlatesList: ExpPlateResultSet[]) => {
        app.winston.info(`Begin: ExpAssay.load.workflows.processExpPlates ${workflowData.name}`);
        return app.models.ExpAssay.load.workflows.processExpPlates(workflowData, expPlatesList);
      })
      .then((results) => {
        app.winston.info(`Complete: Populating Plate Data ${workflowData.name}`);
        resolve(results);
      })
      .catch((error) => {
        app.winston.error(error.stack);
        reject(new Error(error));
      });
  });
};

/**
 * ExpScreenUploadWorkflow.load.workflows.worms.primary.populateExpDesignData
 * This workflow creates the linking between the different wells to conditions, and conditions to other conditions
 * @param {ExpScreenUploadWorkflowResultSet} workflowData
 * @param {ScreenCollection} screenData
 */
ExpScreenUploadWorkflow.load.workflows.worms.populateExpDesignData = function (workflowData: ExpScreenUploadWorkflowResultSet, plateDataList: PlateCollection[]) {
  return new Promise((resolve, reject) => {
    let expDesignRows = app.models.ExpDesign.transform.workflows.screenDataToExpSets(workflowData, plateDataList);
    app.models.ExpDesign.load.workflows.createExpDesigns(workflowData, expDesignRows)
      .then((results) => {
        let screenData = new ScreenCollection({plateDataList: plateDataList, expDesignList: results});
        app.winston.info('Begin: Updating ExpAssay2reagent treatmentGroupId');
        return app.models.ExpAssay2reagent.load.workflows.updateTreatmentGroupId(workflowData, screenData)
          .then(() => {
            app.winston.info('End: Updating ExpAssay2reagent treatmentGroupId');
            resolve(screenData);
          })
          .catch((error) => {
            app.winston.error(error.stack);
            reject(new Error(error));
          });
      })
      .catch((error) => {
        app.winston.error(error.stack);
        reject(new Error(error));
      });
  });
};

/**
 *
 * Once the ExperimentData has been populated its time to make some interfaces
 * This is the part of the workflow that creates teh interfaces
 * It wires up to the wordpressDB to create actual interfaces
 * This is done after all the experiment plates in the set are finished
 * @param workflowData
 * @param {ScreenCollection} screenData
 */
ExpScreenUploadWorkflow.load.workflows.worms.createExpInterfaces = function (workflowData: ExpScreenUploadWorkflowResultSet, screenData: ScreenCollection) {
  app.winston.info(`Creating Experiment Interfaces: ${workflowData.name}`);
  return new Promise((resolve, reject) => {
    //TODO Add in create exp terms here
    app.models.WpTerms.load.workflows.createAnnotationData(workflowData, screenData)
      .then((screenData: ScreenCollection) => {
        //@ts-ignore
        return Promise.map(screenData.plateDataList, (plateData: PlateCollection) => {
          app.winston.info(`Begin Exp Plate: ${plateData.expPlate.barcode} create interfaces`);
          return app.models.ExpPlate.load.workflows.createExpPlateInterface(workflowData, screenData, plateData)
            .then(() => {
              //TODO Make sure to have plateUrl
              return app.models.ExpAssay.load.workflows.createExpAssayInterfaces(workflowData, screenData, plateData);
            })
            .catch((error) => {
              app.winston.error(error);
              return (new Error(error));
            });
        }, {concurrency: 1})
          .then(() => {
            return;
          })
          .catch((error) => {
            return new Error(error);
          })
      })
      .then(() => {
        app.winston.info(`Complete Experiment Interfaces! ${workflowData.name}`);
        // I don't actually do anything with the results from the interfaces
        // They are just there to look pretty
        resolve(screenData);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};
