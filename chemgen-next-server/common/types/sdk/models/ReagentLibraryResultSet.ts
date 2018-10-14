/* tslint:disable */

/* Jillian */
declare var Object: any;
export interface ReagentLibraryResultSetInterface {
  "libraryId"?: number;
  "libraryFullName"?: string;
  "libraryShortName"?: string;
  "libraryType"?: string;
  "librarySource"?: string;
  "libraryVendor"?: string;
  "libraryVendorId"?: string;
  "dateObtained"?: Date;
  "libraryDescription"?: string;
  "libraryLabContact"?: string;
  "libraryMeta"?: string;
}

export class ReagentLibraryResultSet implements ReagentLibraryResultSetInterface {
  "libraryId": number;
  "libraryFullName": string;
  "libraryShortName": string;
  "libraryType": string;
  "librarySource": string;
  "libraryVendor": string;
  "libraryVendorId": string;
  "dateObtained": Date;
  "libraryDescription": string;
  "libraryLabContact": string;
  "libraryMeta": string;
  constructor(data?: ReagentLibraryResultSetInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `ReagentLibraryResultSet`.
   */
  public static getModelName() {
    return "ReagentLibrary";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of ReagentLibraryResultSet for dynamic purposes.
  **/
  public static factory(data: ReagentLibraryResultSetInterface): ReagentLibraryResultSet{
    return new ReagentLibraryResultSet(data);
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
      name: 'ReagentLibraryResultSet',
      plural: 'ReagentLibrariesResultSets',
      path: 'ReagentLibraries',
      idName: 'libraryId',
      properties: {
        "libraryId": {
          name: 'libraryId',
          type: 'number'
        },
        "libraryFullName": {
          name: 'libraryFullName',
          type: 'string'
        },
        "libraryShortName": {
          name: 'libraryShortName',
          type: 'string'
        },
        "libraryType": {
          name: 'libraryType',
          type: 'string'
        },
        "librarySource": {
          name: 'librarySource',
          type: 'string'
        },
        "libraryVendor": {
          name: 'libraryVendor',
          type: 'string'
        },
        "libraryVendorId": {
          name: 'libraryVendorId',
          type: 'string'
        },
        "dateObtained": {
          name: 'dateObtained',
          type: 'Date'
        },
        "libraryDescription": {
          name: 'libraryDescription',
          type: 'string'
        },
        "libraryLabContact": {
          name: 'libraryLabContact',
          type: 'string'
        },
        "libraryMeta": {
          name: 'libraryMeta',
          type: 'string'
        },
      },
      relations: {
      }
    }
  }
}
