/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ChemicalXrefsResultSetInterface {
  "id"?: number;
  "chemicalLibraryId": number;
  "libraryId": number;
  "cidId": number;
  "smiles": string;
}

export class ChemicalXrefsResultSet implements ChemicalXrefsResultSetInterface {
  "id": number;
  "chemicalLibraryId": number;
  "libraryId": number;
  "cidId": number;
  "smiles": string;
  constructor(data?: ChemicalXrefsResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ChemicalXrefsResultSet`.
   */
  public static getModelName() {
    return "ChemicalXrefs";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ChemicalXrefsResultSet for dynamic purposes.
  **/
  public static factory(data: ChemicalXrefsResultSetInterface): ChemicalXrefsResultSet{
    return new ChemicalXrefsResultSet(data);
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
      name: 'ChemicalXrefsResultSet',
      plural: 'ChemicalXrefsResultSets',
      path: 'ChemicalXrefs',
      idName: 'id',
      properties: {
        "id": {
          name: 'id',
          type: 'number'
        },
        "chemicalLibraryId": {
          name: 'chemicalLibraryId',
          type: 'number'
        },
        "libraryId": {
          name: 'libraryId',
          type: 'number'
        },
        "cidId": {
          name: 'cidId',
          type: 'number'
        },
        "smiles": {
          name: 'smiles',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
