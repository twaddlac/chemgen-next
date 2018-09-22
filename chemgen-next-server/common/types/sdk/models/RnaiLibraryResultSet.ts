/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface RnaiLibraryResultSetInterface {
  "rnaiId"?: number;
  "libraryId": number;
  "rnaiType": string;
  "plate": string;
  "well": string;
  "chrom": string;
  "geneName": string;
  "fwdPrimer": string;
  "revPrimer": string;
  "bioloc": string;
  "stocktitle": string;
  "stockloc": string;
}

export class RnaiLibraryResultSet implements RnaiLibraryResultSetInterface {
  "rnaiId": number;
  "libraryId": number;
  "rnaiType": string;
  "plate": string;
  "well": string;
  "chrom": string;
  "geneName": string;
  "fwdPrimer": string;
  "revPrimer": string;
  "bioloc": string;
  "stocktitle": string;
  "stockloc": string;
  constructor(data?: RnaiLibraryResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `RnaiLibraryResultSet`.
   */
  public static getModelName() {
    return "RnaiLibrary";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of RnaiLibraryResultSet for dynamic purposes.
  **/
  public static factory(data: RnaiLibraryResultSetInterface): RnaiLibraryResultSet{
    return new RnaiLibraryResultSet(data);
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
      name: 'RnaiLibraryResultSet',
      plural: 'RnaiLibrariesResultSets',
      path: 'RnaiLibraries',
      idName: 'rnaiId',
      properties: {
        "rnaiId": {
          name: 'rnaiId',
          type: 'number'
        },
        "libraryId": {
          name: 'libraryId',
          type: 'number'
        },
        "rnaiType": {
          name: 'rnaiType',
          type: 'string'
        },
        "plate": {
          name: 'plate',
          type: 'string'
        },
        "well": {
          name: 'well',
          type: 'string'
        },
        "chrom": {
          name: 'chrom',
          type: 'string'
        },
        "geneName": {
          name: 'geneName',
          type: 'string'
        },
        "fwdPrimer": {
          name: 'fwdPrimer',
          type: 'string'
        },
        "revPrimer": {
          name: 'revPrimer',
          type: 'string'
        },
        "bioloc": {
          name: 'bioloc',
          type: 'string'
        },
        "stocktitle": {
          name: 'stocktitle',
          type: 'string'
        },
        "stockloc": {
          name: 'stockloc',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
