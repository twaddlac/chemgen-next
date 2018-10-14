/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ExpBiosampleResultSetInterface {
  "biosampleId"?: number;
  "biosampleName": string;
  "biosampleType": string;
  "biosampleSpecies"?: string;
  "biosampleStrain"?: string;
  "biosampleGene"?: string;
  "biosampleAllele"?: string;
  "biosampleMeta"?: string;
}

export class ExpBiosampleResultSet implements ExpBiosampleResultSetInterface {
  "biosampleId": number;
  "biosampleName": string;
  "biosampleType": string;
  "biosampleSpecies": string;
  "biosampleStrain": string;
  "biosampleGene": string;
  "biosampleAllele": string;
  "biosampleMeta": string;
  constructor(data?: ExpBiosampleResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ExpBiosampleResultSet`.
   */
  public static getModelName() {
    return "ExpBiosample";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ExpBiosampleResultSet for dynamic purposes.
  **/
  public static factory(data: ExpBiosampleResultSetInterface): ExpBiosampleResultSet{
    return new ExpBiosampleResultSet(data);
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
      name: 'ExpBiosampleResultSet',
      plural: 'ExpBiosamplesResultSets',
      path: 'ExpBiosamples',
      idName: 'biosampleId',
      properties: {
        "biosampleId": {
          name: 'biosampleId',
          type: 'number'
        },
        "biosampleName": {
          name: 'biosampleName',
          type: 'string'
        },
        "biosampleType": {
          name: 'biosampleType',
          type: 'string'
        },
        "biosampleSpecies": {
          name: 'biosampleSpecies',
          type: 'string'
        },
        "biosampleStrain": {
          name: 'biosampleStrain',
          type: 'string'
        },
        "biosampleGene": {
          name: 'biosampleGene',
          type: 'string'
        },
        "biosampleAllele": {
          name: 'biosampleAllele',
          type: 'string'
        },
        "biosampleMeta": {
          name: 'biosampleMeta',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
