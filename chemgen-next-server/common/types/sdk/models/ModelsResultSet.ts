/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ModelsResultSetInterface {
  "modelId"?: number;
  "modelName"?: string;
  "modelType"?: string;
  "location"?: string;
  "description"?: string;
  "modelMeta"?: string;
}

export class ModelsResultSet implements ModelsResultSetInterface {
  "modelId": number;
  "modelName": string;
  "modelType": string;
  "location": string;
  "description": string;
  "modelMeta": string;
  constructor(data?: ModelsResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ModelsResultSet`.
   */
  public static getModelName() {
    return "Models";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ModelsResultSet for dynamic purposes.
  **/
  public static factory(data: ModelsResultSetInterface): ModelsResultSet{
    return new ModelsResultSet(data);
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
      name: 'ModelsResultSet',
      plural: 'ModelsResultSets',
      path: 'Models',
      idName: 'modelId',
      properties: {
        "modelId": {
          name: 'modelId',
          type: 'number'
        },
        "modelName": {
          name: 'modelName',
          type: 'string'
        },
        "modelType": {
          name: 'modelType',
          type: 'string'
        },
        "location": {
          name: 'location',
          type: 'string'
        },
        "description": {
          name: 'description',
          type: 'string'
        },
        "modelMeta": {
          name: 'modelMeta',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
