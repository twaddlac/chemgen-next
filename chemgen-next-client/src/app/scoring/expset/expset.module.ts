import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {isEqual, find, get, filter, shuffle, uniqBy} from 'lodash';
import {
    ModelPredictedCountsResultSet,
    ExpScreenUploadWorkflowResultSet,
    ExpDesignResultSet,
    ExpScreenResultSet,
    RnaiLibraryResultSet,
    ChemicalLibraryResultSet,
    ExpAssayResultSet,
    ExpAssay2reagentResultSet,
    ExpPlateResultSet,
    ExpManualScoresResultSet, RnaiWormbaseXrefsResultSet
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
    findExpManualScores(treatmentGroupId: number){
        return this.expSets.expManualScores.filter((expManualScore: ExpManualScoresResultSet) =>{
           return isEqual(expManualScore.treatmentGroupId, treatmentGroupId);
        });
    }

    @Memoize()
    findExpPlates(expWorkflowId: string) {
        return this.expSets.expPlates.filter((expPlate: ExpPlateResultSet) => {
            return isEqual(expWorkflowId, expPlate.expWorkflowId);
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

    @Memoize()
    findReagents(treatmentGroupId) {
        const expAssay2reagents: ExpAssay2reagentResultSet[] = this.expSets.expAssay2reagents.filter((expAssay2reagent) => {
            return isEqual(Number(expAssay2reagent.treatmentGroupId), Number(treatmentGroupId));
        });
        let rnaisList: RnaiLibraryResultSet[] = [];
        let compoundsList: ChemicalLibraryResultSet[] = [];
        expAssay2reagents.map((expAssay2reagent) => {
            if (expAssay2reagent.reagentTable.match('Rnai')) {
                this.expSets.rnaisList.filter((rnai: RnaiLibraryResultSet) => {
                    return isEqual(rnai.libraryId, expAssay2reagent.libraryId) && isEqual(rnai.rnaiId, expAssay2reagent.reagentId);
                }).map((rnai: RnaiLibraryResultSet) => {
                    rnaisList.push(rnai);
                });

                if (rnaisList.length) {
                    rnaisList = uniqBy(rnaisList, 'rnaiId');
                }

                rnaisList.map((rnai: RnaiLibraryResultSet) => {
                    rnai['xrefs'] = this.expSets.rnaisXrefs.filter((rnaiXref: RnaiWormbaseXrefsResultSet) => {
                        return isEqual(rnaiXref.wbGeneSequenceId, rnai.geneName);
                    });
                });

            } else if (expAssay2reagent.reagentTable.match('Chem')) {
                this.expSets.compoundsList.filter((compound: ChemicalLibraryResultSet) => {
                    return isEqual(compound.compoundId, expAssay2reagent.reagentId);
                }).map((compound: ChemicalLibraryResultSet) => {
                    compoundsList.push(compound);
                });

                if (compoundsList.length) {
                    compoundsList = uniqBy(compoundsList, 'compoundId');
                    compoundsList.map((compound: ChemicalLibraryResultSet) => {
                        //For now we don't have any xrefs - so this is just a placeholder
                        compound['xref'] = [];
                    });
                }
            }
        });
        return {rnaisList: rnaisList, compoundsList: compoundsList};
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
            o.expPlates = this.findExpPlates(o.expWorkflow.id);
            o.expManualScores = this.findExpManualScores(treatmentGroupId);
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
    rnaisXrefs?: RnaiWormbaseXrefsResultSet[];
    compoundsList?: ChemicalLibraryResultSet[];
    expAssays?: ExpAssayResultSet;
    expAssay2reagents?: ExpAssay2reagentResultSet[];
    modelPredictedCounts?: ModelPredictedCountsResultSet[];
    expPlates?: ExpPlateResultSet[];
    expScreens?: ExpScreenResultSet[];
    expWorkflows?: ExpScreenUploadWorkflowResultSet[];
    expManualScores?: ExpManualScoresResultSet[];
    expSets?: Array<ExpDesignResultSet[]>;
    fetchedFromCache: boolean;
    currentPage?: number;
    skip?: number;
    totalPages?: number;
    pageSize?: number;
    albums?: Array<any>;
    expGroupTypeAlbums: any;
}

export class ExpSetSearchResults {
    rnaisList?: RnaiLibraryResultSet[] = [];
    rnaisXrefs?: RnaiWormbaseXrefsResultSet[] = [];
    compoundsList?: ChemicalLibraryResultSet[] = [];
    expAssays?: ExpAssayResultSet[] = [];
    expAssay2reagents?: ExpAssay2reagentResultSet[] = [];
    modelPredictedCounts?: ModelPredictedCountsResultSet[] = [];
    expPlates?: ExpPlateResultSet[] = [];
    expScreens?: ExpScreenResultSet[] = [];
    expWorkflows?: ExpScreenUploadWorkflowResultSet[] = [];
    expManualScores?: ExpManualScoresResultSet[] = [];
    fetchedFromCache: boolean = false;
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
