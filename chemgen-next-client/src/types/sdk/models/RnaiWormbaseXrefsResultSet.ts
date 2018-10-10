/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface RnaiWormbaseXrefsResultSetInterface {
  "id"?: number;
  "wbGeneSequenceId": string;
  "wbGeneAccession"?: string;
  "wbGeneCgcName"?: string;
  "wbTranscript"?: string;
  "wbProteinAccession"?: string;
  "insdcParentSeq"?: string;
  "insdcLocusTag"?: string;
  "insdcProteinId"?: string;
  "uniprotAccession"?: string;
}

export class RnaiWormbaseXrefsResultSet implements RnaiWormbaseXrefsResultSetInterface {
  "id": number;
  "wbGeneSequenceId": string;
  "wbGeneAccession": string;
  "wbGeneCgcName": string;
  "wbTranscript": string;
  "wbProteinAccession": string;
  "insdcParentSeq": string;
  "insdcLocusTag": string;
  "insdcProteinId": string;
  "uniprotAccession": string;
  constructor(data?: RnaiWormbaseXrefsResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `RnaiWormbaseXrefsResultSet`.
   */
  public static getModelName() {
    return "RnaiWormbaseXrefs";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of RnaiWormbaseXrefsResultSet for dynamic purposes.
  **/
  public static factory(data: RnaiWormbaseXrefsResultSetInterface): RnaiWormbaseXrefsResultSet{
    return new RnaiWormbaseXrefsResultSet(data);
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
      name: 'RnaiWormbaseXrefsResultSet',
      plural: 'RnaiWormbaseXrefsResultSets',
      path: 'RnaiWormbaseXrefs',
      idName: 'id',
      properties: {
        "id": {
          name: 'id',
          type: 'number'
        },
        "wbGeneSequenceId": {
          name: 'wbGeneSequenceId',
          type: 'string'
        },
        "wbGeneAccession": {
          name: 'wbGeneAccession',
          type: 'string'
        },
        "wbGeneCgcName": {
          name: 'wbGeneCgcName',
          type: 'string'
        },
        "wbTranscript": {
          name: 'wbTranscript',
          type: 'string'
        },
        "wbProteinAccession": {
          name: 'wbProteinAccession',
          type: 'string'
        },
        "insdcParentSeq": {
          name: 'insdcParentSeq',
          type: 'string'
        },
        "insdcLocusTag": {
          name: 'insdcLocusTag',
          type: 'string'
        },
        "insdcProteinId": {
          name: 'insdcProteinId',
          type: 'string'
        },
        "uniprotAccession": {
          name: 'uniprotAccession',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
