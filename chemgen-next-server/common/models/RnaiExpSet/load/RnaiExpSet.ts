import app  = require('../../../../server/server.js');
import {WorkflowModel} from "../../index";
import {
  ChemicalLibraryResultSet,
  ExpAssay2reagentResultSet, ExpAssayResultSet, ExpDesignResultSet, ExpGroupResultSet, ExpPlateResultSet,
  ExpScreenResultSet, ExpScreenUploadWorkflowResultSet,
  ModelPredictedCountsResultSet,
  RnaiLibraryResultSet,
  RnaiWormbaseXrefsResultSet
} from "../../../types/sdk/models";
import {find, uniqBy, isEqual, slice, shuffle, isUndefined, isNull, isEmpty, isArray} from 'lodash';
import Promise = require('bluebird');
import {ExpSetSearch, ExpSetSearchResults} from "../../ExpSet/types";

const RnaiExpSet = app.models.RnaiExpSet as (typeof WorkflowModel);


/**
 * Here be a few convenience methods to query for query RNAi sets
 * Most of the actual work is done over at app.models.ExpSet
 */

/**
 * Get ExpSets by GeneList
 * GeneList is an array of strings, with either the wormbase name of the cosmid name
 * Optionally, this also allows for searching by libraryId, screen, plate, expWorkflowId
 * If search.includeCounts == True, this will also fetch the includeCounts
 * @param {ExpSetSearch} search
 */
RnaiExpSet.extract.workflows.getExpSetsByGeneList = function (search?: ExpSetSearch) {
  return new Promise((resolve, reject) => {

    search = new ExpSetSearch(search);
    let data = new ExpSetSearchResults({});

    console.log(JSON.stringify(search));
    app.models.RnaiLibrary.extract.workflows
      .getRnaiLibraryFromUserGeneList(search.rnaiSearch, search)
      .then((results: RnaiLibraryResultSet[]) => {
        if (isEmpty(results)) {
          resolve(new ExpSetSearchResults());
        } else {
          data.rnaisList = results;
          app.models.ExpSet.extract.buildBasicPaginationData(data, search)
            .then((data: ExpSetSearchResults) => {
              return app.models.ExpSet.extract.searchExpAssay2reagents(data, search);
            })
            .then((results: ExpSetSearchResults) => {
              app.winston.info(`ExpAssayCount: ${results.expAssays.length}`);
              app.winston.info(`ExpAssay2ReagentCount: ${results.expAssay2reagents.length}`);
              app.winston.info(`ModelPredictedPhenoCount: ${results.modelPredictedCounts.length}`);
              app.winston.info(`ExpSetsCount: ${results.expSets.length}`);
              app.winston.info(`genesListCount: ${results.rnaisList.length}`);
              resolve(results);
            })
            .catch((error) => {
              reject(new Error(error));
            });
        }
      })
  });
};

/**
 * This function does not include searching for genes, only experimental data
 * @param {ExpSetSearch} search
 */
RnaiExpSet.extract.workflows.getExpSets = function (search?: ExpSetSearch) {
  return new Promise((resolve, reject) => {

    search = new ExpSetSearch(search);
    let data: ExpSetSearchResults = new ExpSetSearchResults({rnaisList: []});

    app.models.ExpSet.extract.buildBasicPaginationData(data, search)
      .then((data: ExpSetSearchResults) => {
        return app.models.ExpSet.extract.searchExpAssay2reagents(data, search);
      })
      .then((searchResults: ExpSetSearchResults) => {
        let where = {
          where: {
            rnaiId: {
              inq: searchResults.expAssay2reagents.map((expAssay2reagent: ExpAssay2reagentResultSet) => {
                return expAssay2reagent.reagentId;
              }),
            },
          }
        };
        return app.models.RnaiLibrary
          .find(where)
          .then((rnaiResults: RnaiLibraryResultSet[]) => {
            searchResults.rnaisList = rnaiResults;
            app.winston.info(`ExpAssayCount: ${searchResults.expAssays.length}`);
            app.winston.info(`ExpAssay2ReagentCount: ${searchResults.expAssay2reagents.length}`);
            app.winston.info(`ModelPredictedPhenoCount: ${searchResults.modelPredictedCounts.length}`);
            app.winston.info(`ExpSetsCount: ${searchResults.expSets.length}`);
            app.winston.info(`genesListCount: ${searchResults.rnaisList.length}`);
            return searchResults;
            // TODO - need to write a new function for getting xrefs from RnaiLibraryResults
            // Now if an xref is not found it returns an empty result, and ignores the RnaiLibrayr Result, which is no GOOD
            // return app.models.RnaiLibrary.extract.workflows.getRnaiLibraryFromUserGeneList(rnaisList, search)
          })
          .catch((error) => {
            return new Error(error);
          });
      })
      .then((searchResults: ExpSetSearchResults) => {
        app.winston.info('resolving here!');
        resolve(searchResults);
      })
      .catch((error) => {
        reject(new Error(error));
      });
  });
};

