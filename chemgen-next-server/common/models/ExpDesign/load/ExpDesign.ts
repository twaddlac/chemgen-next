import app  = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import {ExpDesignResultSet, ExpGroupResultSet, ExpScreenUploadWorkflowResultSet} from "../../../types/sdk/models";
import {PlateCollection, WellCollection} from "../../../types/custom/wellData";

import Promise = require('bluebird');
import {uniqWith, shuffle, isEqual} from 'lodash';

const ExpDesign = app.models.ExpDesign as (typeof WorkflowModel);

ExpDesign.load.workflows.createExpDesigns = function (workflowData: ExpScreenUploadWorkflowResultSet, expDesignRows: ExpDesignResultSet[]) {
  expDesignRows = uniqWith(expDesignRows, isEqual);
  return new Promise((resolve, reject) => {
    //@ts-ignore
    Promise.map(shuffle(expDesignRows), (expDesignRow) => {
      return ExpDesign
        .findOrCreate({where: app.etlWorkflow.helpers.findOrCreateObj(expDesignRow)}, expDesignRow)
        .then((results) => {
          return results[0];
        })
        .catch((error) => {
          if (error.match('DUP')) {
            return expDesignRow
          } else {
            return new Error(error);
          }
        });
    })
      .then((results: ExpDesignResultSet[]) => {
        // let expDesignRows = contactSheetResults.map((result) => {
        //   return result[0];
        // });
        resolve(results);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};
