/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface WpTermTaxonomyResultSetInterface {
  "termTaxonomyId"?: number;
  "termId": number;
  "taxonomy": string;
  "description"?: string;
  "parent": number;
  "count": number;
}

export class WpTermTaxonomyResultSet implements WpTermTaxonomyResultSetInterface {
  "termTaxonomyId": number;
  "termId": number;
  "taxonomy": string;
  "description": string;
  "parent": number;
  "count": number;
  constructor(data?: WpTermTaxonomyResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `WpTermTaxonomyResultSet`.
   */
  public static getModelName() {
    return "WpTermTaxonomy";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of WpTermTaxonomyResultSet for dynamic purposes.
  **/
  public static factory(data: WpTermTaxonomyResultSetInterface): WpTermTaxonomyResultSet{
    return new WpTermTaxonomyResultSet(data);
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
      name: 'WpTermTaxonomyResultSet',
      plural: 'WpTermTaxonomiesResultSets',
      path: 'WpTermTaxonomies',
      idName: 'termTaxonomyId',
      properties: {
        "termTaxonomyId": {
          name: 'termTaxonomyId',
          type: 'number'
        },
        "termId": {
          name: 'termId',
          type: 'number'
        },
        "taxonomy": {
          name: 'taxonomy',
          type: 'string'
        },
        "description": {
          name: 'description',
          type: 'string'
        },
        "parent": {
          name: 'parent',
          type: 'number'
        },
        "count": {
          name: 'count',
          type: 'number'
        },
      },
      relations: {
      }
    }
  }
}
