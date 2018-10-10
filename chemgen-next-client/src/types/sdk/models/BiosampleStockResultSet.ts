/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface BiosampleStockResultSetInterface {
  "biosampleStockId"?: number;
  "biosampleId"?: number;
  "containerId"?: number;
  "containerType"?: string;
  "location"?: string;
  "datePrepared"?: Date;
  "preparedBy"?: string;
  "biosampleStockMeta"?: string;
}

export class BiosampleStockResultSet implements BiosampleStockResultSetInterface {
  "biosampleStockId": number;
  "biosampleId": number;
  "containerId": number;
  "containerType": string;
  "location": string;
  "datePrepared": Date;
  "preparedBy": string;
  "biosampleStockMeta": string;
  constructor(data?: BiosampleStockResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `BiosampleStockResultSet`.
   */
  public static getModelName() {
    return "BiosampleStock";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of BiosampleStockResultSet for dynamic purposes.
  **/
  public static factory(data: BiosampleStockResultSetInterface): BiosampleStockResultSet{
    return new BiosampleStockResultSet(data);
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
      name: 'BiosampleStockResultSet',
      plural: 'BiosampleStocksResultSets',
      path: 'BiosampleStocks',
      idName: 'biosampleStockId',
      properties: {
        "biosampleStockId": {
          name: 'biosampleStockId',
          type: 'number'
        },
        "biosampleId": {
          name: 'biosampleId',
          type: 'number'
        },
        "containerId": {
          name: 'containerId',
          type: 'number'
        },
        "containerType": {
          name: 'containerType',
          type: 'string'
        },
        "location": {
          name: 'location',
          type: 'string'
        },
        "datePrepared": {
          name: 'datePrepared',
          type: 'Date'
        },
        "preparedBy": {
          name: 'preparedBy',
          type: 'string'
        },
        "biosampleStockMeta": {
          name: 'biosampleStockMeta',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
