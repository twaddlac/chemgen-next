/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ModelPredictedPhenoResultSetInterface {
  "id"?: number;
  "modelId"?: number;
  "screenId"?: number;
  "plateId"?: number;
  "assayId"?: number;
  "reagentId"?: number;
  "assayImagePath"?: string;
  "conclusion"?: string;
  "modelPredictedCountsMeta"?: string;
  "expWorkflowId"?: string;
}

export class ModelPredictedPhenoResultSet implements ModelPredictedPhenoResultSetInterface {
  "id": number;
  "modelId": number;
  "screenId": number;
  "plateId": number;
  "assayId": number;
  "reagentId": number;
  "assayImagePath": string;
  "conclusion": string;
  "modelPredictedCountsMeta": string;
  "expWorkflowId": string;
  constructor(data?: ModelPredictedPhenoResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ModelPredictedPhenoResultSet`.
   */
  public static getModelName() {
    return "ModelPredictedPheno";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ModelPredictedPhenoResultSet for dynamic purposes.
  **/
  public static factory(data: ModelPredictedPhenoResultSetInterface): ModelPredictedPhenoResultSet{
    return new ModelPredictedPhenoResultSet(data);
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
      name: 'ModelPredictedPhenoResultSet',
      plural: 'ModelPredictedPhenosResultSets',
      path: 'ModelPredictedPhenos',
      idName: 'id',
      properties: {
        "id": {
          name: 'id',
          type: 'number'
        },
        "modelId": {
          name: 'modelId',
          type: 'number'
        },
        "screenId": {
          name: 'screenId',
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
        "reagentId": {
          name: 'reagentId',
          type: 'number'
        },
        "assayImagePath": {
          name: 'assayImagePath',
          type: 'string'
        },
        "conclusion": {
          name: 'conclusion',
          type: 'string'
        },
        "modelPredictedCountsMeta": {
          name: 'modelPredictedCountsMeta',
          type: 'string'
        },
        "expWorkflowId": {
          name: 'expWorkflowId',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
