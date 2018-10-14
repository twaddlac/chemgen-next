/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ExpManualScoreCodeResultSetInterface {
  "manualscorecodeId"?: number;
  "description": string;
  "shortDescription": string;
  "formName": string;
  "formCode": string;
  "manualValue": number;
  "manualGroup": string;
}

export class ExpManualScoreCodeResultSet implements ExpManualScoreCodeResultSetInterface {
  "manualscorecodeId": number;
  "description": string;
  "shortDescription": string;
  "formName": string;
  "formCode": string;
  "manualValue": number;
  "manualGroup": string;
  constructor(data?: ExpManualScoreCodeResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpManualScoreCodeResultSet`.
   */
  public static getModelName() {
    return "ExpManualScoreCode";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpManualScoreCodeResultSet for dynamic purposes.
  **/
  public static factory(data: ExpManualScoreCodeResultSetInterface): ExpManualScoreCodeResultSet{
    return new ExpManualScoreCodeResultSet(data);
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
      name: 'ExpManualScoreCodeResultSet',
      plural: 'ExpManualScoreCodesResultSets',
      path: 'ExpManualScoreCodes',
      idName: 'manualscorecodeId',
      properties: {
        "manualscorecodeId": {
          name: 'manualscorecodeId',
          type: 'number'
        },
        "description": {
          name: 'description',
          type: 'string'
        },
        "shortDescription": {
          name: 'shortDescription',
          type: 'string'
        },
        "formName": {
          name: 'formName',
          type: 'string'
        },
        "formCode": {
          name: 'formCode',
          type: 'string'
        },
        "manualValue": {
          name: 'manualValue',
          type: 'number'
        },
        "manualGroup": {
          name: 'manualGroup',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
