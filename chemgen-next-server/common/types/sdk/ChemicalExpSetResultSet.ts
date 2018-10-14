/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ChemicalExpSetResultSetInterface {
  "treat_chemical"?: Array<any>;
  "ctrl_chemical"?: Array<any>;
  "ctrl_strain"?: Array<any>;
  "ctrl_null"?: Array<any>;
  "id"?: number;
}

export class ChemicalExpSetResultSet implements ChemicalExpSetResultSetInterface {
  "treat_chemical": Array<any>;
  "ctrl_chemical": Array<any>;
  "ctrl_strain": Array<any>;
  "ctrl_null": Array<any>;
  "id": number;
  constructor(data?: ChemicalExpSetResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ChemicalExpSetResultSet`.
   */
  public static getModelName() {
    return "ChemicalExpSet";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ChemicalExpSetResultSet for dynamic purposes.
  **/
  public static factory(data: ChemicalExpSetResultSetInterface): ChemicalExpSetResultSet{
    return new ChemicalExpSetResultSet(data);
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
      name: 'ChemicalExpSetResultSet',
      plural: 'ChemicalExpSetsResultSets',
      path: 'ChemicalExpSets',
      idName: 'id',
      properties: {
        "treat_chemical": {
          name: 'treat_chemical',
          type: 'Array&lt;any&gt;'
        },
        "ctrl_chemical": {
          name: 'ctrl_chemical',
          type: 'Array&lt;any&gt;'
        },
        "ctrl_strain": {
          name: 'ctrl_strain',
          type: 'Array&lt;any&gt;'
        },
        "ctrl_null": {
          name: 'ctrl_null',
          type: 'Array&lt;any&gt;'
        },
        "id": {
          name: 'id',
          type: 'number'
        },
      },
      relations: {
      }
    }
  }
}
