/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ExpGroupResultSetInterface {
  "expGroupId"?: number;
  "expGroupType"?: string;
  "screenId"?: number;
  "libraryId"?: number;
  "biosampleId"?: number;
  "well"?: string;
  "expWorkflowId"?: string;
}

export class ExpGroupResultSet implements ExpGroupResultSetInterface {
  "expGroupId": number;
  "expGroupType": string;
  "screenId": number;
  "libraryId": number;
  "biosampleId": number;
  "well": string;
  "expWorkflowId": string;
  constructor(data?: ExpGroupResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpGroupResultSet`.
   */
  public static getModelName() {
    return "ExpGroup";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpGroupResultSet for dynamic purposes.
  **/
  public static factory(data: ExpGroupResultSetInterface): ExpGroupResultSet{
    return new ExpGroupResultSet(data);
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
      name: 'ExpGroupResultSet',
      plural: 'ExpGroupsResultSets',
      path: 'ExpGroups',
      idName: 'expGroupId',
      properties: {
        "expGroupId": {
          name: 'expGroupId',
          type: 'number'
        },
        "expGroupType": {
          name: 'expGroupType',
          type: 'string'
        },
        "screenId": {
          name: 'screenId',
          type: 'number'
        },
        "libraryId": {
          name: 'libraryId',
          type: 'number'
        },
        "biosampleId": {
          name: 'biosampleId',
          type: 'number'
        },
        "well": {
          name: 'well',
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
