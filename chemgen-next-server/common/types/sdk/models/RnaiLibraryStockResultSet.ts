/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface RnaiLibraryStockResultSetInterface {
  "stockId"?: number;
  "libraryId"?: number;
  "rnaiId"?: number;
  "plateId"?: number;
  "assayId"?: number;
  "datePrepared"?: Date;
  "location"?: string;
  "preparedBy"?: string;
  "stockMeta"?: string;
  "well"?: string;
}

export class RnaiLibraryStockResultSet implements RnaiLibraryStockResultSetInterface {
  "stockId": number;
  "libraryId": number;
  "rnaiId": number;
  "plateId": number;
  "assayId": number;
  "datePrepared": Date;
  "location": string;
  "preparedBy": string;
  "stockMeta": string;
  "well": string;
  constructor(data?: RnaiLibraryStockResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `RnaiLibraryStockResultSet`.
   */
  public static getModelName() {
    return "RnaiLibraryStock";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of RnaiLibraryStockResultSet for dynamic purposes.
  **/
  public static factory(data: RnaiLibraryStockResultSetInterface): RnaiLibraryStockResultSet{
    return new RnaiLibraryStockResultSet(data);
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
      name: 'RnaiLibraryStockResultSet',
      plural: 'RnaiLibraryStocksResultSets',
      path: 'RnaiLibraryStocks',
      idName: 'stockId',
      properties: {
        "stockId": {
          name: 'stockId',
          type: 'number'
        },
        "libraryId": {
          name: 'libraryId',
          type: 'number'
        },
        "rnaiId": {
          name: 'rnaiId',
          type: 'number'
        },
        "plateId": {
          name: 'plateId',
          type: 'number'
        },
        "assayId": {
          name: 'assayId',
          type: 'number'
        },
        "datePrepared": {
          name: 'datePrepared',
          type: 'Date'
        },
        "location": {
          name: 'location',
          type: 'string'
        },
        "preparedBy": {
          name: 'preparedBy',
          type: 'string'
        },
        "stockMeta": {
          name: 'stockMeta',
          type: 'string'
        },
        "well": {
          name: 'well',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
