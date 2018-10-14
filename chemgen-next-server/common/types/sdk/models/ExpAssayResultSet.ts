/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ExpAssayResultSetInterface {
  "assayId"?: number;
  "screenId"?: number;
  "plateId"?: number;
  "biosampleId"?: number;
  "assayCodeName"?: string;
  "assayWell"?: string;
  "expGroupId"?: number;
  "assayReplicateNum"?: number;
  "assayImagePath"?: string;
  "assayWpAssayPostId"?: number;
  "assayMeta"?: string;
  "expWorkflowId"?: string;
}

export class ExpAssayResultSet implements ExpAssayResultSetInterface {
  "assayId": number;
  "screenId": number;
  "plateId": number;
  "biosampleId": number;
  "assayCodeName": string;
  "assayWell": string;
  "expGroupId": number;
  "assayReplicateNum": number;
  "assayImagePath": string;
  "assayWpAssayPostId": number;
  "assayMeta": string;
  "expWorkflowId": string;
  constructor(data?: ExpAssayResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpAssayResultSet`.
   */
  public static getModelName() {
    return "ExpAssay";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpAssayResultSet for dynamic purposes.
  **/
  public static factory(data: ExpAssayResultSetInterface): ExpAssayResultSet{
    return new ExpAssayResultSet(data);
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
      name: 'ExpAssayResultSet',
      plural: 'ExpAssaysResultSets',
      path: 'ExpAssays',
      idName: 'assayId',
      properties: {
        "assayId": {
          name: 'assayId',
          type: 'number'
        },
        "screenId": {
          name: 'screenId',
          type: 'number'
        },
        "plateId": {
          name: 'plateId',
          type: 'number'
        },
        "biosampleId": {
          name: 'biosampleId',
          type: 'number'
        },
        "assayCodeName": {
          name: 'assayCodeName',
          type: 'string'
        },
        "assayWell": {
          name: 'assayWell',
          type: 'string'
        },
        "expGroupId": {
          name: 'expGroupId',
          type: 'number'
        },
        "assayReplicateNum": {
          name: 'assayReplicateNum',
          type: 'number'
        },
        "assayImagePath": {
          name: 'assayImagePath',
          type: 'string'
        },
        "assayWpAssayPostId": {
          name: 'assayWpAssayPostId',
          type: 'number'
        },
        "assayMeta": {
          name: 'assayMeta',
          type: 'string'
        },
        "expWorkflowId": {
          name: 'expWorkflowId',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
