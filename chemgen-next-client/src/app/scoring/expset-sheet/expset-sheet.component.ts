import {Component, OnInit, Input} from '@angular/core';
import {ExpsetModule, ExpSetSearchResults} from '../expset/expset.module';
import {
    ChemicalLibraryResultSet,
    ExpAssay2reagentResultSet, ExpPlateResultSet,
    ExpScreenResultSet,
    ExpScreenUploadWorkflowResultSet,
    ModelPredictedCountsResultSet,
    RnaiLibraryResultSet
} from '../../../sdk/models';

import {find, isEqual} from 'lodash';
import {ExpSetSearch} from "../../search-forms/search-form-worms/search-form-worms.component";

/**
 * WIP
 * Allow for searching by different expData - genesList, chemicals, expWorkflow, plate, barcode, date, etc
 * Also add infinite scroll
 */

@Component({
    selector: 'app-expset-sheet',
    templateUrl: './expset-sheet.component.html',
    styleUrls: ['./expset-sheet.component.css']
})
export class ExpsetSheetComponent implements OnInit {
    @Input() expSets: any;
    @Input() expSetSearch: ExpSetSearch;

    expSetModule: ExpsetModule;
    albumData: Array<any> = [];
    albumsContainer: Array<any> = [];
    // expSet: any;
    expSetAlbums: any = {treatmentReagentImages: [], ctrlReagentImages: [], ctrlNullImages: [], ctrlStrainImages: []};
    parsedExpSets: any;
    expSetData: any;

    constructor() {
        this.expSetData = [];
    }

    ngOnInit() {
        this.parseExpSets();
    }

    parseExpSets() {
        // The expSet data structure is a flat data structure that can incorporate many experiment sets across multiple screens and batches
        // Its flat so that it is somewhat normalized, otherwise it gets really big really fast to send as a JSON object
        // Here we the joins and denormalize it so we can pass everything to the child component
        this.expSetModule = new ExpsetModule(this.expSets);
        this.expSetData = this.expSetModule.expSets.albums.map((album: any) => {
            let expWorkflow: ExpScreenUploadWorkflowResultSet = this.expSetModule.findExpWorkflow(album.expWorkflowId);
            let expScreen: ExpScreenResultSet = this.expSetModule.findExpScreen(expWorkflow.screenId);
            let expPlates: ExpPlateResultSet[] = this.expSetModule.findExpPlates(album.expWorkflowId);
            let reagentsList = this.expSetModule.findReagents(album.treatmentGroupId);
            let expManualScores = this.expSetModule.findExpManualScores(album.treatmentGroupId);
            album.expWorkflow = expWorkflow;
            album.expSet = this.expSetModule.findExpSets(album.treatmentGroupId);
            return {
                albums: album,
                expWorkflow: expWorkflow,
                expSet: album.expSet,
                expScreen: expScreen,
                rnaisList: reagentsList.rnaisList,
                compoundsList: reagentsList.compoundsList,
                expPlates: expPlates,
                expManualScores: expManualScores,
            };
        });
    }


}
