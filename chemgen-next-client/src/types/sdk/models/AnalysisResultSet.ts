/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface AnalysisResultSetInterface {
  "name"?: string;
  "code"?: string;
  "description"?: string;
  "dateCreated"?: Date;
  "dateModified"?: Date;
  "results"?: any;
  "id"?: any;
}

export class AnalysisResultSet implements AnalysisResultSetInterface {
  "name": string;
  "code": string;
  "description": string;
  "dateCreated": Date;
  "dateModified": Date;
  "results": any;
  "id": any;
  constructor(data?: AnalysisResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `AnalysisResultSet`.
   */
  public static getModelName() {
    return "Analysis";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of AnalysisResultSet for dynamic purposes.
  **/
  public static factory(data: AnalysisResultSetInterface): AnalysisResultSet{
    return new AnalysisResultSet(data);
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
      name: 'AnalysisResultSet',
      plural: 'AnalysesResultSets',
      path: 'Analyses',
      idName: 'id',
      properties: {
        "name": {
          name: 'name',
          type: 'string'
        },
        "code": {
          name: 'code',
          type: 'string'
        },
        "description": {
          name: 'description',
          type: 'string'
        },
        "dateCreated": {
          name: 'dateCreated',
          type: 'Date'
        },
        "dateModified": {
          name: 'dateModified',
          type: 'Date'
        },
        "results": {
          name: 'results',
          type: 'any'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
      },
      relations: {
      }
    }
  }
}
