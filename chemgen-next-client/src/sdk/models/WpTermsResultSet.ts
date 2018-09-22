/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface WpTermsResultSetInterface {
  "termId"?: number;
  "name": string;
  "slug": string;
  "termGroup": number;
}

export class WpTermsResultSet implements WpTermsResultSetInterface {
  "termId": number;
  "name": string;
  "slug": string;
  "termGroup": number;
  constructor(data?: WpTermsResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `WpTermsResultSet`.
   */
  public static getModelName() {
    return "WpTerms";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of WpTermsResultSet for dynamic purposes.
  **/
  public static factory(data: WpTermsResultSetInterface): WpTermsResultSet{
    return new WpTermsResultSet(data);
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
      name: 'WpTermsResultSet',
      plural: 'WpTermsResultSets',
      path: 'WpTerms',
      idName: 'termId',
      properties: {
        "termId": {
          name: 'termId',
          type: 'number'
        },
        "name": {
          name: 'name',
          type: 'string'
        },
        "slug": {
          name: 'slug',
          type: 'string'
        },
        "termGroup": {
          name: 'termGroup',
          type: 'number'
        },
      },
      relations: {
      }
    }
  }
}
