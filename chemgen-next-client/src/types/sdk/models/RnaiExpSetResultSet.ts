/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface RnaiExpSetResultSetInterface {
  "treat_rnai": any;
  "ctrl_strain"?: Array<any>;
  "ctrl_null"?: Array<any>;
  "ctrl_rnai"?: Array<any>;
  "id"?: number;
}

export class RnaiExpSetResultSet implements RnaiExpSetResultSetInterface {
  "treat_rnai": any;
  "ctrl_strain": Array<any>;
  "ctrl_null": Array<any>;
  "ctrl_rnai": Array<any>;
  "id": number;
  constructor(data?: RnaiExpSetResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `RnaiExpSetResultSet`.
   */
  public static getModelName() {
    return "RnaiExpSet";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of RnaiExpSetResultSet for dynamic purposes.
  **/
  public static factory(data: RnaiExpSetResultSetInterface): RnaiExpSetResultSet{
    return new RnaiExpSetResultSet(data);
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
      name: 'RnaiExpSetResultSet',
      plural: 'RnaiExpSetsResultSets',
      path: 'RnaiExpSets',
      idName: 'id',
      properties: {
        "treat_rnai": {
          name: 'treat_rnai',
          type: 'any'
        },
        "ctrl_strain": {
          name: 'ctrl_strain',
          type: 'Array&lt;any&gt;'
        },
        "ctrl_null": {
          name: 'ctrl_null',
          type: 'Array&lt;any&gt;'
        },
        "ctrl_rnai": {
          name: 'ctrl_rnai',
          type: 'Array&lt;any&gt;'
        },
        "id": {
          name: 'id',
          type: 'number'
        },
      },
      relations: {
      }
    }
  }
}
