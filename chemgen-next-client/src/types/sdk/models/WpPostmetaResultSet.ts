/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface WpPostmetaResultSetInterface {
  "metaId"?: number;
  "postId": number;
  "metaKey"?: string;
  "metaValue"?: string;
}

export class WpPostmetaResultSet implements WpPostmetaResultSetInterface {
  "metaId": number;
  "postId": number;
  "metaKey": string;
  "metaValue": string;
  constructor(data?: WpPostmetaResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `WpPostmetaResultSet`.
   */
  public static getModelName() {
    return "WpPostmeta";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of WpPostmetaResultSet for dynamic purposes.
  **/
  public static factory(data: WpPostmetaResultSetInterface): WpPostmetaResultSet{
    return new WpPostmetaResultSet(data);
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
      name: 'WpPostmetaResultSet',
      plural: 'WpPostmetaResultSets',
      path: 'WpPostmeta',
      idName: 'metaId',
      properties: {
        "metaId": {
          name: 'metaId',
          type: 'number'
        },
        "postId": {
          name: 'postId',
          type: 'number'
        },
        "metaKey": {
          name: 'metaKey',
          type: 'string'
        },
        "metaValue": {
          name: 'metaValue',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
