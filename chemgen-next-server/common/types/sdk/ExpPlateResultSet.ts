/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ExpPlateResultSetInterface {
  "plateId"?: number;
  "screenId"?: number;
  "screenStage"?: string;
  "screenType"?: string;
  "plateImageDate"?: Date;
  "plateTemperature"?: string;
  "plateAssayDate"?: Date;
  "plateImagePath"?: string;
  "plateMeta"?: string;
  "barcode"?: string;
  "instrumentId"?: number;
  "instrumentPlateId"?: number;
  "instrumentPlateImagePath"?: string;
  "plateWpPlatePostId"?: number;
  "expWorkflowId"?: string;
}

export class ExpPlateResultSet implements ExpPlateResultSetInterface {
  "plateId": number;
  "screenId": number;
  "screenStage": string;
  "screenType": string;
  "plateImageDate": Date;
  "plateTemperature": string;
  "plateAssayDate": Date;
  "plateImagePath": string;
  "plateMeta": string;
  "barcode": string;
  "instrumentId": number;
  "instrumentPlateId": number;
  "instrumentPlateImagePath": string;
  "plateWpPlatePostId": number;
  "expWorkflowId": string;
  constructor(data?: ExpPlateResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpPlateResultSet`.
   */
  public static getModelName() {
    return "ExpPlate";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpPlateResultSet for dynamic purposes.
  **/
  public static factory(data: ExpPlateResultSetInterface): ExpPlateResultSet{
    return new ExpPlateResultSet(data);
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
      name: 'ExpPlateResultSet',
      plural: 'ExpPlatesResultSets',
      path: 'ExpPlates',
      idName: 'plateId',
      properties: {
        "plateId": {
          name: 'plateId',
          type: 'number'
        },
        "screenId": {
          name: 'screenId',
          type: 'number'
        },
        "screenStage": {
          name: 'screenStage',
          type: 'string'
        },
        "screenType": {
          name: 'screenType',
          type: 'string'
        },
        "plateImageDate": {
          name: 'plateImageDate',
          type: 'Date'
        },
        "plateTemperature": {
          name: 'plateTemperature',
          type: 'string'
        },
        "plateAssayDate": {
          name: 'plateAssayDate',
          type: 'Date'
        },
        "plateImagePath": {
          name: 'plateImagePath',
          type: 'string'
        },
        "plateMeta": {
          name: 'plateMeta',
          type: 'string'
        },
        "barcode": {
          name: 'barcode',
          type: 'string'
        },
        "instrumentId": {
          name: 'instrumentId',
          type: 'number'
        },
        "instrumentPlateId": {
          name: 'instrumentPlateId',
          type: 'number'
        },
        "instrumentPlateImagePath": {
          name: 'instrumentPlateImagePath',
          type: 'string'
        },
        "plateWpPlatePostId": {
          name: 'plateWpPlatePostId',
          type: 'number'
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
