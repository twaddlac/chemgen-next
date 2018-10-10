/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ModelPredictedRankResultSetInterface {
  "modelPredictedRankId"?: number;
  "screenId": number;
  "expWorkflowId": string;
  "modelId": number;
  "treatmentGroupId": number;
  "minDifference"?: number;
  "maxDifference"?: number;
  "avgDifference"?: number;
  "modelPredictedRankMeta"?: string;
}

export class ModelPredictedRankResultSet implements ModelPredictedRankResultSetInterface {
  "modelPredictedRankId": number;
  "screenId": number;
  "expWorkflowId": string;
  "modelId": number;
  "treatmentGroupId": number;
  "minDifference": number;
  "maxDifference": number;
  "avgDifference": number;
  "modelPredictedRankMeta": string;
  constructor(data?: ModelPredictedRankResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ModelPredictedRankResultSet`.
   */
  public static getModelName() {
    return "ModelPredictedRank";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ModelPredictedRankResultSet for dynamic purposes.
  **/
  public static factory(data: ModelPredictedRankResultSetInterface): ModelPredictedRankResultSet{
    return new ModelPredictedRankResultSet(data);
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
      name: 'ModelPredictedRankResultSet',
      plural: 'ModelPredictedRanksResultSets',
      path: 'ModelPredictedRanks',
      idName: 'modelPredictedRankId',
      properties: {
        "modelPredictedRankId": {
          name: 'modelPredictedRankId',
          type: 'number'
        },
        "screenId": {
          name: 'screenId',
          type: 'number'
        },
        "expWorkflowId": {
          name: 'expWorkflowId',
          type: 'string'
        },
        "modelId": {
          name: 'modelId',
          type: 'number'
        },
        "treatmentGroupId": {
          name: 'treatmentGroupId',
          type: 'number'
        },
        "minDifference": {
          name: 'minDifference',
          type: 'number'
        },
        "maxDifference": {
          name: 'maxDifference',
          type: 'number'
        },
        "avgDifference": {
          name: 'avgDifference',
          type: 'number'
        },
        "modelPredictedRankMeta": {
          name: 'modelPredictedRankMeta',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
