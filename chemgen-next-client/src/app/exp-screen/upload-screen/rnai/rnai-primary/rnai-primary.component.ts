import {Component, OnInit} from '@angular/core';
import {ExpBiosampleResultSet, ExpScreenResultSet, PlateResultSet, ReagentLibraryResultSet} from '../../../../../types/sdk/models';
import {PlateApi, ExpScreenUploadWorkflowApi, ExpBiosampleApi, ReagentLibraryApi} from '../../../../../types/sdk/services/custom';

import {ExpScreenApi} from '../../../../../types/sdk/services/custom';

import {RnaiScreenUploadWorkflowResultSet} from '../../../../../types/sdk/models';
import {JsonPipe} from '@angular/common';
import {orderBy, isNull, isEmpty, chunk} from 'lodash';

import {RnaiScreenDesign, SearchExpBiosamples, ExperimentData, RNAiExpUpload} from '../../helpers';

@Component({
  selector: 'app-rnai-primary',
  templateUrl: './rnai-primary.component.html',
  styleUrls: ['./rnai-primary.component.css'],
  providers: [PlateApi, ExpBiosampleApi, ReagentLibraryApi]
})
export class RnaiPrimaryComponent implements OnInit {

  public expBiosampleModel: SearchExpBiosamples;
  public expDataModel: ExperimentData;
  public plateModels: Array<RnaiScreenDesign>;
  public expScreenUploads: Array<RnaiScreenUploadWorkflowResultSet>;
  public errorMessages: Array<any> = [];
  public success: Boolean = false;
  public expScreenUpload: RNAiExpUpload;

  constructor(private plateApi: PlateApi,
              private expBiosampleApi: ExpBiosampleApi,
              private expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi,
              private reagentLibraryApi: ReagentLibraryApi,
              private expScreenApi: ExpScreenApi) {
    this.expScreenUpload = new RNAiExpUpload();
  }

  ngOnInit() {
    this.plateModels = [new RnaiScreenDesign(this.plateApi)];
    this.expBiosampleModel = new SearchExpBiosamples(this.expBiosampleApi);
    this.expDataModel = new ExperimentData(this.reagentLibraryApi, this.expScreenApi, 'RNAi');
    this.expBiosampleModel.searchSamples();
    this.expScreenUploads = [];
  }

  addNewScreenDesign() {
    const tPlate = new RnaiScreenDesign(this.plateApi);
    try {
      tPlate.creationDates = this.plateModels[this.plateModels.length - 1].creationDates;
      tPlate.chromosome = this.plateModels[this.plateModels.length - 1].chromosome;
      tPlate.libraryPlate = this.plateModels[this.plateModels.length - 1].libraryPlate;
      tPlate.conditionCode = this.plateModels[this.plateModels.length - 1].conditionCode;
    } catch (error) {
      console.error('there is no screen to push...');
    }
    if (this.plateModels.length > 0) {
      this.plateModels[this.plateModels.length - 1].collapse = true;
      console.log('Setting collapse');
    }
    this.plateModels.push(tPlate);
  }

  removeScreenDesign(index: number) {
    if (index > -1) {
      this.plateModels.splice(index, 1);
    }
  }

  toggleCollapse(index: number) {
    if (this.plateModels[index].collapse) {
      this.plateModels[index].collapse = false;
    } else {
      this.plateModels[index].collapse = true;
    }
  }

  createWorkflowData() {
    this.plateModels.map((plateModel) => {
      const model = this.expScreenUpload.setDefaults(plateModel, this.expDataModel, this.expBiosampleModel);
      model.search = {
        'rnaiLibrary': {
          'plate': plateModel.libraryPlate,
          'quadrant': plateModel.libraryQuadrant,
          'chrom': plateModel.chromosome,
        }
      };
      model.screenStage = 'primary';

      this.validateWorkflowData(model);
      this.expScreenUploads.push(model);
    });
    this.expScreenUploadWorkflowApi.doWork(this.expScreenUploads)
      .toPromise()
      .then((results) => {
        console.log('wheeee!');
        console.log(JSON.stringify(results));
      })
      .catch((error) => {
        console.error(`I have na error ${error}`);
      });
  }


  submitWorkflowData() {
    this.errorMessages = [];
    this.expScreenUploads = [];
    this.createWorkflowData();
    if (!isEmpty(this.errorMessages)) {
      // There are errors do not submit!!!
    } else {
      // Make the call!
      this.success = true;
    }
  }

  validateWorkflowData(model: RnaiScreenUploadWorkflowResultSet) {
    this.errorMessages = this.expScreenUpload.validateWorkflowData(model, this.errorMessages);
  }
}

