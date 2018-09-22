import {
  ChemicalLibraryResultSet,
  ExpAssay2reagentResultSet, ExpAssayResultSet, ExpDesignResultSet,
  ExpGroupResultSet, ExpPlateResultSet,
  ExpScreenResultSet, ExpScreenUploadWorkflowResultSet,
  RnaiLibraryResultSet,
  ModelPredictedCountsResultSet,
} from "../../../types/sdk/models/index";
import {isNull, isUndefined, isArray, isObject} from 'lodash';

declare var Object: any;

export interface ExpSetSearchInterface {
  chemicalSearch ?: Array<string>;
  rnaiSearch ?: Array<string>;
  assaySearch ?: Array<number>;
  librarySearch ?: Array<any>;
  screenSearch ?: Array<any>;
  expWorkflowSearch ?: Array<any>;
  plateSearch ?: Array<number>;
  currentPage ?: number;
  skip ?: number;
  pageSize ?: number;
  ctrlLimit ?: number;
  expGroupSearch ?: Array<number>;
  includeCounts ?: Boolean;
  includeAlbums ?: Boolean;
  includeManualScores ?: Boolean;
  filterManualScores ?: Boolean;
}

export class ExpSetSearch {
  rnaiSearch ?: Array<string>;
  chemicalSearch ?: Array<string>;
  assaySearch ?: Array<number>;
  librarySearch ?: Array<any>;
  screenSearch ?: Array<any>;
  expWorkflowSearch ?: Array<any>;
  plateSearch ?: Array<number>;
  currentPage ?: number;
  skip ?: number;
  pageSize ?: number = 20;
  ctrlLimit ?: number = 4;
  expGroupSearch ?: Array<number>;
  includeCounts ?: Boolean = true;
  includeAlbums ?: Boolean = true;
  includeManualScores ?: Boolean = false;
  filterManualScores ?: Boolean = false;

  constructor(data?: ExpSetSearchInterface) {
    data.includeCounts = true;
    data.includeAlbums = true;
    //Allow for searching either using pagination or skip
    if (isUndefined(data.skip) || isNull(data.skip)) {
      data.skip = 0;
    }
    if (isUndefined(data.currentPage) || isNull(data.currentPage)) {
      data.currentPage = 1;
    } else {
      data.skip = data.pageSize * data.currentPage;
    }
    // If these aren't already an array, make them an array
    ['arraySearch', 'rnaiSearch', 'chemicalSearch', 'librarySearch', 'screenSearch', 'expWorkflowSearch', 'expGroupSearch'].map((searchKey) => {
      if (isUndefined(data[searchKey]) || isNull(data[searchKey] || !data[searchKey])) {
        data[searchKey] = [];
      } else if (!isArray(data[searchKey] )) {
        data[searchKey] = [data[searchKey]];
      }
    });
    Object.assign(this, data);
  }
}

export interface ExpSetSearchResultsInterface {
  rnaisList?: RnaiLibraryResultSet[];
  compoundsList?: ChemicalLibraryResultSet[];
  expAssays?: ExpAssayResultSet[];
  expAssay2reagents?: ExpAssay2reagentResultSet[];
  modelPredictedCounts?: ModelPredictedCountsResultSet[];
  expPlates?: ExpPlateResultSet[];
  expScreens?: ExpScreenResultSet[];
  expWorkflows?: ExpScreenUploadWorkflowResultSet[];
  expSets?: Array<ExpDesignResultSet[]>;
  currentPage ?: number;
  skip ?: number;
  totalPages ?: number;
  pageSize ?: number;
  albums ?: Array<any>;
}

export class ExpSetSearchResults {
  rnaisList?: RnaiLibraryResultSet[] = [];
  compoundsList?: ChemicalLibraryResultSet[] = [];
  expAssays?: ExpAssayResultSet[] = [];
  expAssay2reagents?: ExpAssay2reagentResultSet[] = [];
  modelPredictedCounts?: ModelPredictedCountsResultSet[] = [];
  expPlates?: ExpPlateResultSet[] = [];
  expScreens?: ExpScreenResultSet[] = [];
  expWorkflows?: ExpScreenUploadWorkflowResultSet[] = [];
  expSets?: Array<ExpDesignResultSet[]>;
  // expSets?: any = [];
  currentPage ?: number = 1;
  skip ?: number = 0;
  totalPages ?: number = 0;
  pageSize ?: number = 20;
  albums ?: Array<any> = [];

  constructor(data?: ExpSetSearchResultsInterface) {
    Object.assign(this, data);
  }
}


/**
 * Search by Counts
 */

export interface ExpSetSearchByCountsInterface {
  assaySearch ?: Array<number>;
  modelSearch ?: Array<number>;
  screenSearch ?: Array<any>;
  expWorkflowSearch ?: Array<any>;
  plateSearch ?: Array<number>;
  currentPage ?: number;
  skip ?: number;
  pageSize ?: number;
  ctrlLimit ?: number;
  expGroupSearch ?: Array<number>;
  includeCounts ?: Boolean;
  includeAlbums ?: Boolean;
  includeManualScores ?: Boolean;
  filterManualScores ?: Boolean;
  orderBy ?: string;
  order ?: string;
}

export class ExpSetSearchByCounts {
  assaySearch ?: Array<number>;
  modelSearch ?: Array<number>;
  screenSearch ?: Array<any>;
  expWorkflowSearch ?: Array<any>;
  plateSearch ?: Array<number>;
  currentPage ?: number;
  skip ?: number;
  pageSize ?: number = 20;
  ctrlLimit ?: number = 4;
  expGroupSearch ?: Array<number>;
  includeCounts ?: Boolean = true;
  includeAlbums ?: Boolean = true;
  includeManualScores ?: Boolean = false;
  filterManualScores ?: Boolean = false;
  orderBy ?: string;
  order ?: string = 'DESC';

  constructor(data?: ExpSetSearchByCountsInterface) {
    if(!isObject(data)){
      data = {};
    }
    data.includeCounts = true;
    data.includeAlbums = true;
    //Allow for searching either using pagination or skip
    if (isUndefined(data.skip) || isNull(data.skip)) {
      data.skip = 0;
    }
    if (isUndefined(data.currentPage) || isNull(data.currentPage)) {
      data.currentPage = 1;
    } else {
      data.skip = data.pageSize * data.currentPage;
    }
    // If these aren't already an array, make them an array
    ['arraySearch', 'modelSearch', 'screenSearch', 'expWorkflowSearch', 'expGroupSearch'].map((searchKey) => {
      if (isUndefined(data[searchKey]) || isNull(data[searchKey] || !data[searchKey])) {
        data[searchKey] = [];
      } else if (!isArray(data[searchKey]  )) {
        data[searchKey] = [data[searchKey]];
      }
    });
    Object.assign(this, data);
  }
}
