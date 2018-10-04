import {Component, OnInit} from '@angular/core';

import {isEmpty, isEqual} from 'lodash';

import {SearchFormExpScreenFormResults} from "../search-form-exp-screen/search-form-exp-screen.component";
import {SearchFormRnaiFormResults} from "../search-form-rnai/search-form-rnai.component";
import {ExpSetSearch} from "../search-form-worms/search-form-worms.component";
import {ExpSetApi} from "../../../sdk/services/custom";

@Component({
    // selector: 'app-search-form-expsets',
    templateUrl: './search-form-expsets.component.html',
    styleUrls: ['./search-form-expsets.component.css']
})
export class SearchFormExpsetsComponent implements OnInit {
    searchFormExpScreenResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();
    searchFormRnaiFormResults: SearchFormRnaiFormResults = new SearchFormRnaiFormResults();
    expSetSearch: ExpSetSearch = new ExpSetSearch();

    expSets: any = null;
    public formSubmitted = false;
    public showProgress = false;
    public expSetView = true;

    constructor(private expSetApi: ExpSetApi) {
    }

    ngOnInit() {
    }

    onScrollUp() {
        console.log('scrolled up!');
    }

    onScrollDown() {
        console.log('scrolled down!');
    }

    getNewExpSets() {
        this.formSubmitted = false;
        this.showProgress = false;
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
        //TODO Add back in the RNAi endpoint
        if (!isEmpty(this.searchFormRnaiFormResults.rnaisList)) {
            this.expSetSearch.rnaiSearch = this.searchFormRnaiFormResults.rnaisList;
        }

        this.formSubmitted = true;
        this.showProgress = true;

        this.expSetApi.getExpSetsByWorkflowId(this.expSetSearch)
            .toPromise()
            .then((results) => {
                console.log('got results');
                this.expSets = results.results;
                this.showProgress = false;
            })
            .catch((error) => {
                console.log(error);
                return new Error(error);
            });

    }
}
