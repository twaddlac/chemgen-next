/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ChemicalLibraryStockResultSetInterface {
  "stockId"?: number;
  "libraryId"?: number;
  "compoundId"?: number;
  "plateId"?: number;
  "assayId"?: number;
  "concentration"?: number;
  "solvent"?: string;
  "datePrepared"?: Date;
  "location"?: string;
  "preparedBy"?: string;
  "stockType"?: string;
  "stockMeta"?: string;
  "well"?: string;
}

export class ChemicalLibraryStockResultSet implements ChemicalLibraryStockResultSetInterface {
  "stockId": number;
  "libraryId": number;
  "compoundId": number;
  "plateId": number;
  "assayId": number;
  "concentration": number;
  "solvent": string;
  "datePrepared": Date;
  "location": string;
  "preparedBy": string;
  "stockType": string;
  "stockMeta": string;
  "well": string;
  constructor(data?: ChemicalLibraryStockResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ChemicalLibraryStockResultSet`.
   */
  public static getModelName() {
    return "ChemicalLibraryStock";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ChemicalLibraryStockResultSet for dynamic purposes.
  **/
  public static factory(data: ChemicalLibraryStockResultSetInterface): ChemicalLibraryStockResultSet{
    return new ChemicalLibraryStockResultSet(data);
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
      name: 'ChemicalLibraryStockResultSet',
      plural: 'ChemicalLibraryStocksResultSets',
      path: 'ChemicalLibraryStocks',
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
        "compoundId": {
          name: 'compoundId',
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
        "concentration": {
          name: 'concentration',
          type: 'number'
        },
        "solvent": {
          name: 'solvent',
          type: 'string'
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
        "stockType": {
          name: 'stockType',
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
