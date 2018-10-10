/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ChemicalLibraryResultSetInterface {
  "compoundId"?: number;
  "libraryId"?: number;
  "plate": string;
  "well": string;
  "compoundLibraryId"?: number;
  "compoundSystematicName"?: string;
  "compoundCommonName"?: string;
  "compoundMw"?: number;
  "compoundFormula"?: string;
}

export class ChemicalLibraryResultSet implements ChemicalLibraryResultSetInterface {
  "compoundId": number;
  "libraryId": number;
  "plate": string;
  "well": string;
  "compoundLibraryId": number;
  "compoundSystematicName": string;
  "compoundCommonName": string;
  "compoundMw": number;
  "compoundFormula": string;
  constructor(data?: ChemicalLibraryResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ChemicalLibraryResultSet`.
   */
  public static getModelName() {
    return "ChemicalLibrary";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ChemicalLibraryResultSet for dynamic purposes.
  **/
  public static factory(data: ChemicalLibraryResultSetInterface): ChemicalLibraryResultSet{
    return new ChemicalLibraryResultSet(data);
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
      name: 'ChemicalLibraryResultSet',
      plural: 'ChemicalLibrariesResultSets',
      path: 'ChemicalLibraries',
      idName: 'compoundId',
      properties: {
        "compoundId": {
          name: 'compoundId',
          type: 'number'
        },
        "libraryId": {
          name: 'libraryId',
          type: 'number'
        },
        "plate": {
          name: 'plate',
          type: 'string'
        },
        "well": {
          name: 'well',
          type: 'string'
        },
        "compoundLibraryId": {
          name: 'compoundLibraryId',
          type: 'number'
        },
        "compoundSystematicName": {
          name: 'compoundSystematicName',
          type: 'string'
        },
        "compoundCommonName": {
          name: 'compoundCommonName',
          type: 'string'
        },
        "compoundMw": {
          name: 'compoundMw',
          type: 'number'
        },
        "compoundFormula": {
          name: 'compoundFormula',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
