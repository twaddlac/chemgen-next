import {Component, OnInit, Input} from '@angular/core';
import {ExpsetModule} from '../expset/expset.module';
import {ModelPredictedCountsResultSet} from '../../../sdk/models';

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
    expSetModule: ExpsetModule;
    albumData: Array<any> = [];
    albumsContainer: Array<any> = [];
    // expSet: any;
    expSetAlbums: any = {treatmentReagentImages: [], ctrlReagentImages: [], ctrlNullImages: [], ctrlStrainImages: []};

    parsedExpSets: any;

    constructor() {
    }

    ngOnInit() {
        // this.parseExpSets();
        this.parseExpSets();
    }

    parseExpSets() {
        this.expSetModule = new ExpsetModule(this.expSets);

        this.parsedExpSets = this.expSets.modelPredictedCounts.map((wellCounts: ModelPredictedCountsResultSet) => {
            return this.expSetModule.getExpSet(wellCounts);
        });

        // this.expSet = this.parsedExpSets[0];
        this.albumsContainer = this.parsedExpSets.map((parsedExpSet: any) => {
            const expSetAlbums = ['treatmentReagentImages', 'ctrlReagentImages', 'ctrlStrainImages', 'ctrlNullImages'].map((albumName) => {
                this.expSetModule.createAlbum(this.parsedExpSets, albumName, parsedExpSet.albums[albumName]);
            });
            return {expSet: parsedExpSet, expSetAlbums: expSetAlbums};
        });

    }


}
