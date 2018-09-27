import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {isEqual, find, get, shuffle} from 'lodash';
import {
    ModelPredictedCountsResultSet, ExpScreenUploadWorkflowResultSet, ExpDesignResultSet, ExpScreenResultSet,
    RnaiLibraryResultSet, ChemicalLibraryResultSet, ExpAssayResultSet, ExpAssay2reagentResultSet, ExpPlateResultSet
} from '../../../sdk/models';
import {Memoize} from 'lodash-decorators';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: []
})

export class ExpsetModule {

    public expSets: ExpSetSearchResults;

    constructor(expSets: ExpSetSearchResults) {
        this.expSets = expSets;
    }

    @Memoize()
    findExpWorkflow(expWorkflowId: string) {
        return find(this.expSets.expWorkflows, (expWorkflow: ExpScreenUploadWorkflowResultSet) => {
            return isEqual(expWorkflowId, expWorkflow.id);
        });
    }

    @Memoize()
    findExpScreen(screenId: number) {
        return find(this.expSets.expScreens, (screen: ExpScreenResultSet) => {
            return isEqual(screenId, screen.screenId);
        });
    }

    @Memoize()
    getTreatmentGroupIdFromDesign(expGroupId: number) {
        return this.expSets.expSets.filter((expSet: Array<ExpDesignResultSet>) => {
            return expSet.filter((expDesignRow: ExpDesignResultSet) => {
                return isEqual(expGroupId, expDesignRow.treatmentGroupId) || isEqual(expGroupId, expDesignRow.controlGroupId);
            })[0];
        })[0];
    }

    @Memoize()
    findModelPredictedCounts(treatmentGroupId: number) {
        return this.expSets.modelPredictedCounts.filter((counts: ModelPredictedCountsResultSet) => {
            return isEqual(counts.treatmentGroupId, treatmentGroupId);
        });
    }

    @Memoize()
    findExpSets(treatmentGroupId) {
        return this.expSets.expSets.filter((expSet: Array<ExpDesignResultSet>) => {
            return isEqual(treatmentGroupId, expSet[0].treatmentGroupId);
        })[0];
    }

    @Memoize()
    findAlbums(treatmentGroupId) {
        return this.expSets.albums.filter((album: any) => {
            return isEqual(treatmentGroupId, album.treatmentGroupId);
        })[0];
    }

    // TODO Fix this - it assumes there are counts
    getExpSet(wellCounts: ModelPredictedCountsResultSet) {
        const o: any = {};

        let treatmentGroupId = wellCounts.treatmentGroupId;
        o.expWorkflow = this.findExpWorkflow(wellCounts.expWorkflowId);
        o.expScreen = this.findExpScreen(wellCounts.screenId);

        if (!treatmentGroupId) {
            const expSet = this.getTreatmentGroupIdFromDesign(wellCounts.expGroupId);
            if (expSet) {
                treatmentGroupId = expSet[0].treatmentGroupId;
                wellCounts.treatmentGroupId = treatmentGroupId;
            }
        }

        if (treatmentGroupId) {
            o.modelPredictedCounts = this.findModelPredictedCounts(treatmentGroupId);
            o.expSets = this.findExpSets(treatmentGroupId);
            o.albums = this.findAlbums(treatmentGroupId);
        } else {
            o.modelPredictedCounts = [];
            o.expSets = [];
            o.albums = {};
        }
        ['ctrlNullImages', 'ctrlStrainImages'].map((ctrlKey) => {
            if (get(o.albums, ctrlKey)) {
                o.albums[ctrlKey] = shuffle(o.albums[ctrlKey]).slice(0, 4);
            }
        });

        return o;
    }

    createAlbum(expSetAlbums: any, albumName: string, images: Array<string>) {
        expSetAlbums[albumName] = images.map((image: string) => {
            if (image) {
                return {
                    src: `http://onyx.abudhabi.nyu.edu/images/${image}-autolevel.jpeg`,
                    caption: `Image ${image} caption here`,
                    thumb: `http://onyx.abudhabi.nyu.edu/images/${image}-autolevel.jpeg`,
                };
            }
        }).filter((t) => {
            return t;
        });
        return expSetAlbums;
    }

}

export interface ExpSetSearchResultsInterface {
    rnaisList?: RnaiLibraryResultSet;
    compoundsList?: ChemicalLibraryResultSet[];
    expAssays?: ExpAssayResultSet;
    expAssay2reagents?: ExpAssay2reagentResultSet[];
    modelPredictedCounts?: ModelPredictedCountsResultSet[];
    expPlates?: ExpPlateResultSet[];
    expScreens?: ExpScreenResultSet[];
    expWorkflows?: ExpScreenUploadWorkflowResultSet[];
    expSets?: Array<ExpDesignResultSet[]>;
    currentPage?: number;
    skip?: number;
    totalPages?: number;
    pageSize?: number;
    albums?: Array<any>;
    expGroupTypeAlbums: any;
}

export class ExpSetSearchResults {
    rnaisList?: RnaiLibraryResultSet[] = [];
    compoundsList?: ChemicalLibraryResultSet[] = [];
    expAssays?: ExpAssayResultSet[] = [];
    expAssay2reagents?: ExpAssay2reagentResultSet[] = [];
    modelPredictedCounts?: ModelPredictedCountsResultSet[] = [];
    expPlates?: ExpPlateResultSet[] = [];
    expScreens?: ExpScreenResultSet[] = [];
    expWorkflows?: ExpScreenUploadWorkflowResultSet[] = [];
    expSets?: Array<ExpDesignResultSet[]>;
    currentPage ?: number = 1;
    skip ?: number = 0;
    totalPages ?: number = 0;
    pageSize ?: number = 20;
    albums ?: Array<any> = [];
    expGroupTypeAlbums: any;

    constructor(data?: ExpSetSearchResultsInterface) {
        Object.assign(this, data);
    }
}
