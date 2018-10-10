/* tslint:disable */
import {
  ExpManualScoresResultSet
} from '../index';

/* Jillian */
declare var Object: any;
export interface ExpAssay2reagentResultSetInterface {
  "assay2reagentId"?: number;
  "screenId"?: number;
  "libraryId"?: number;
  "plateId"?: number;
  "assayId"?: number;
  "stockId"?: number;
  "reagentId"?: number;
  "parentLibraryPlate"?: string;
  "parentLibraryWell"?: string;
  "stockLibraryWell"?: string;
  "reagentName"?: string;
  "reagentType"?: string;
  "expGroupId"?: number;
  "treatmentGroupId"?: number;
  "reagentTable"?: string;
  "assay2reagentMeta"?: string;
  "expWorkflowId"?: string;
  expManualScores?: ExpManualScoresResultSet[];
}

export class ExpAssay2reagentResultSet implements ExpAssay2reagentResultSetInterface {
  "assay2reagentId": number;
  "screenId": number;
  "libraryId": number;
  "plateId": number;
  "assayId": number;
  "stockId": number;
  "reagentId": number;
  "parentLibraryPlate": string;
  "parentLibraryWell": string;
  "stockLibraryWell": string;
  "reagentName": string;
  "reagentType": string;
  "expGroupId": number;
  "treatmentGroupId": number;
  "reagentTable": string;
  "assay2reagentMeta": string;
  "expWorkflowId": string;
  expManualScores: ExpManualScoresResultSet[];
  constructor(data?: ExpAssay2reagentResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpAssay2reagentResultSet`.
   */
  public static getModelName() {
    return "ExpAssay2reagent";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpAssay2reagentResultSet for dynamic purposes.
  **/
  public static factory(data: ExpAssay2reagentResultSetInterface): ExpAssay2reagentResultSet{
    return new ExpAssay2reagentResultSet(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'ExpAssay2reagentResultSet',
      plural: 'ExpAssay2reagentsResultSets',
      path: 'ExpAssay2reagents',
      idName: 'assay2reagentId',
      properties: {
        "assay2reagentId": {
          name: 'assay2reagentId',
          type: 'number'
        },
        "screenId": {
          name: 'screenId',
          type: 'number'
        },
        "libraryId": {
          name: 'libraryId',
          type: 'number'
        },
        "plateId": {
          name: 'plateId',
          type: 'number'
        },
        "assayId": {
          name: 'assayId',
          type: 'number'
        },
        "stockId": {
          name: 'stockId',
          type: 'number'
        },
        "reagentId": {
          name: 'reagentId',
          type: 'number'
        },
        "parentLibraryPlate": {
          name: 'parentLibraryPlate',
          type: 'string'
        },
        "parentLibraryWell": {
          name: 'parentLibraryWell',
          type: 'string'
        },
        "stockLibraryWell": {
          name: 'stockLibraryWell',
          type: 'string'
        },
        "reagentName": {
          name: 'reagentName',
          type: 'string'
        },
        "reagentType": {
          name: 'reagentType',
          type: 'string'
        },
        "expGroupId": {
          name: 'expGroupId',
          type: 'number'
        },
        "treatmentGroupId": {
          name: 'treatmentGroupId',
          type: 'number'
        },
        "reagentTable": {
          name: 'reagentTable',
          type: 'string'
        },
        "assay2reagentMeta": {
          name: 'assay2reagentMeta',
          type: 'string'
        },
        "expWorkflowId": {
          name: 'expWorkflowId',
          type: 'string'
        },
      },
      relations: {
        expManualScores: {
          name: 'expManualScores',
          type: 'ExpManualScoresResultSet[]',
          model: 'ExpManualScores',
          relationType: 'hasMany',
                  keyFrom: 'assayId',
          keyTo: 'assayId'
        },
      }
    }
  }
}
