import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {SearchFormViewOptionsResults} from '../../search-forms/search-form-view-options/search-form-view-options.component';
import {SearchFormExpScreenFormResults} from '../../search-forms/search-form-exp-screen/search-form-exp-screen.component';
import {SearchFormRnaiFormResults} from '../../search-forms/search-form-rnai/search-form-rnai.component';
import {isEmpty, isEqual} from 'lodash';
import {ExpSetApi} from '../../../sdk/services/custom';
import {NgProgress} from '@ngx-progressbar/core';

@Component({
    selector: 'app-search-form-worms',
    templateUrl: './search-form-worms.component.html',
    styleUrls: ['./search-form-worms.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFormWormsComponent implements OnInit {

    searchFormViewOptionsResults: SearchFormViewOptionsResults = new SearchFormViewOptionsResults();
    searchFormExpScreenResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();
    searchFormRnaiFormResults: SearchFormRnaiFormResults = new SearchFormRnaiFormResults();

    expSetSearch: ExpSetSearch = new ExpSetSearch();
    expSets: any = null;
    public formSubmitted = false;
    public showProgress = false;

    public contactSheetView = false;
    public contactSheetPlateView = false;
    public expSetView = false;

    constructor(private expSetApi: ExpSetApi, public progress: NgProgress) {
    }

    ngOnInit() {
    }

    getNewExpSets() {
        this.formSubmitted = false;
        this.showProgress = false;
        this.progress.complete();
        this.onSubmit();
    }

    onSubmit() {
        this.expSets = null;
        this.expSetSearch.pageSize = 50;
        this.expSetSearch.ctrlLimit = 20;
        // this.expSetSearch.skip = 18;
        if (this.searchFormExpScreenResults.expScreen) {
            this.expSetSearch.screenSearch = [this.searchFormExpScreenResults.expScreen.screenId];
        }

        if (this.searchFormExpScreenResults.expScreenWorkflow) {
            this.expSetSearch.expWorkflowSearch = [this.searchFormExpScreenResults.expScreenWorkflow.id];
        }
        // use the getRnais endpoint instead
        if (!isEmpty(this.searchFormRnaiFormResults.rnaisList)) {
            this.expSetSearch.rnaiSearch = this.searchFormRnaiFormResults.rnaisList;
        }

        // Set the View
        if (isEqual(this.searchFormViewOptionsResults.viewOptions, 'expSetView')) {
            this.expSetSearch.filterManualScores = false;
            this.expSetSearch.includeManualScores = true;
            this.expSetView = true;
            this.contactSheetView = false;
        } else if (isEqual(this.searchFormViewOptionsResults.viewOptions, 'contactSheetView')) {
            // this.expSetSearch.filterManualScores = true;
            this.expSetSearch.filterManualScores = false;
            this.expSetView = false;
            this.contactSheetView = true;
        } else if (isEqual(this.searchFormViewOptionsResults.viewOptions, 'contactSheetPlateView')) {
            // this.expSetSearch.filterManualScores = true;
            this.expSetSearch.filterManualScores = false;
            this.expSetView = false;
            this.contactSheetPlateView = true;
        }

        // Order
        // TODO if filtering based on an rnaiList / chemicalsList, this is done on the client side
        if (isEqual(this.searchFormViewOptionsResults.rankOrder, 'plateId')) {
            this.expSetSearch.orderBy = 'plateId';
        } else if (!isEqual(this.searchFormViewOptionsResults.rankOrder, 'none')) {
            const orders = this.searchFormViewOptionsResults.rankOrder.split('-');
            this.expSetSearch.orderBy = orders[0];
            this.expSetSearch.order = orders[1];
        }

        this.formSubmitted = true;
        this.showProgress = true;
        this.progress.start();
        if (this.contactSheetPlateView) {
            this.expSetApi.getUnScoredExpSetsByPlate(this.expSetSearch)
                .toPromise()
                .then((results) => {
                    console.log('got results');
                    this.expSets = results.results;
                    this.showProgress = false;
                    this.progress.complete();
                })
                .catch((error) => {
                    console.log(error);
                    return new Error(error);
                });

        } else if (isEqual(this.searchFormViewOptionsResults.rankOrder, 'none')) {
            this.expSetApi.getUnScoredExpSets(this.expSetSearch)
                .toPromise()
                .then((results) => {
                    console.log('got results');
                    this.expSets = results.results;
                    this.showProgress = false;
                    this.progress.complete();
                })
                .catch((error) => {
                    console.log(error);
                    return new Error(error);
                });
        } else {
            this.expSetApi.getUnScoredExpSetsByCounts(this.expSetSearch)
                .toPromise()
                .then((results) => {
                    console.log('got results');
                    this.showProgress = false;
                    this.progress.complete();
                    console.log(JSON.stringify(results.results));
                    this.expSets = results.results;
                })
                .catch((error) => {
                    console.log(error);
                    return new Error(error);
                });
        }
    }
}

declare var Object: any;

export interface ExpSetSearchInterface {
    chemicalSearch?: Array<string>;
    rnaiSearch?: Array<string>;
    assaySearch?: Array<number>;
    librarySearch?: Array<any>;
    screenSearch?: Array<any>;
    expWorkflowSearch?: Array<any>;
    plateSearch?: Array<number>;
    currentPage?: number;
    skip?: number;
    pageSize?: number;
    ctrlLimit?: number;
    expGroupSearch?: Array<number>;
    includeCounts?: Boolean;
    includeAlbums?: Boolean;
    includeManualScores?: Boolean;
    filterManualScores?: Boolean;
    orderBy?: string;
    order?: string;
}


export class ExpSetSearch {
    rnaiSearch ?: Array<string>;
    chemicalSearch ?: Array<string>;
    assaySearch ?: Array<number>;
    librarySearch ?: Array<any>;
    screenSearch ?: Array<any>;
    expWorkflowSearch ?: Array<any>;
    plateSearch ?: Array<number>;
    currentPage ?: number;
    skip ?: number;
    pageSize ?: number;
    ctrlLimit ?: number;
    expGroupSearch ?: Array<number>;
    includeCounts ?: Boolean = true;
    includeAlbums ?: Boolean = true;
    includeManualScores ?: Boolean = false;
    filterManualScores ?: Boolean = false;

    // If ordering by counts
    orderBy ?: string;
    order ?: string;

    constructor(data?: ExpSetSearchInterface) {
        Object.assign(this, data);
    }
}
