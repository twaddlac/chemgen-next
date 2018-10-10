/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ExpSetResultSetInterface {
  "id"?: number;
}

export class ExpSetResultSet implements ExpSetResultSetInterface {
  "id": number;
  constructor(data?: ExpSetResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpSetResultSet`.
   */
  public static getModelName() {
    return "ExpSet";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpSetResultSet for dynamic purposes.
  **/
  public static factory(data: ExpSetResultSetInterface): ExpSetResultSet{
    return new ExpSetResultSet(data);
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
      name: 'ExpSetResultSet',
      plural: 'ExpSetsResultSets',
      path: 'ExpSets',
      idName: 'id',
      properties: {
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
