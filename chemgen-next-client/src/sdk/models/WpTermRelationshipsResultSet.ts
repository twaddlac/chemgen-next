/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface WpTermRelationshipsResultSetInterface {
  "objectId": number;
  "termTaxonomyId": number;
  "termOrder": number;
}

export class WpTermRelationshipsResultSet implements WpTermRelationshipsResultSetInterface {
  "objectId": number;
  "termTaxonomyId": number;
  "termOrder": number;
  constructor(data?: WpTermRelationshipsResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `WpTermRelationshipsResultSet`.
   */
  public static getModelName() {
    return "WpTermRelationships";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of WpTermRelationshipsResultSet for dynamic purposes.
  **/
  public static factory(data: WpTermRelationshipsResultSetInterface): WpTermRelationshipsResultSet{
    return new WpTermRelationshipsResultSet(data);
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
      name: 'WpTermRelationshipsResultSet',
      plural: 'WpTermRelationshipsResultSets',
      path: 'WpTermRelationships',
      idName: 'objectId',
      properties: {
        "objectId": {
          name: 'objectId',
          type: 'number'
        },
        "termTaxonomyId": {
          name: 'termTaxonomyId',
          type: 'number'
        },
        "termOrder": {
          name: 'termOrder',
          type: 'number'
        },
      },
      relations: {
      }
    }
  }
}
