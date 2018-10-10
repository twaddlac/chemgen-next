import {Component, OnInit} from '@angular/core';

import {isEmpty, cloneDeep, get, isEqual, range} from 'lodash';

import {SearchFormExpScreenFormResults} from "../search-form-exp-screen/search-form-exp-screen.component";
import {SearchFormRnaiFormResults} from "../search-form-rnai/search-form-rnai.component";
import {ExpSetApi} from "../../../types/sdk/services/custom";
import {ExpsetModule} from "../../scoring/expset/expset.module";
import {NgxSpinnerService} from "ngx-spinner";
import {ExpSetSearchResults, ExpSetSearch} from "../../../types/custom/ExpSetTypes";

@Component({
    templateUrl: './search-form-expsets.component.html',
    styleUrls: ['./search-form-expsets.component.css']
})
export class SearchFormExpsetsComponent implements OnInit {
    searchFormExpScreenResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();
    searchFormRnaiFormResults: SearchFormRnaiFormResults = new SearchFormRnaiFormResults();
    expSetSearch: ExpSetSearch = new ExpSetSearch();

    public expSets: ExpSetSearchResults = null;
    public expSetsModule: ExpsetModule;

    public formSubmitted = false;
    public expSetView = true;
    public lowerPageRange: Array<number> = [];
    public upperPageRange: Array<number> = [];

    constructor(private expSetApi: ExpSetApi, private spinner: NgxSpinnerService) {
        this.expSetSearch.currentPage = 1;
    }

    ngOnInit() {
    }

    getNewExpSets() {
        this.formSubmitted = false;
        this.onSubmit();
    }

    onSubmit() {
        this.expSets = null;
        this.expSetsModule = null;
        this.expSetSearch.pageSize = 1;
        this.expSetSearch.ctrlLimit = 4;
        this.expSetSearch.skip = null;
        if (this.searchFormExpScreenResults.expScreen) {
            this.expSetSearch.screenSearch = [this.searchFormExpScreenResults.expScreen.screenId];
        }

        if (this.searchFormExpScreenResults.expScreenWorkflow) {
            this.expSetSearch.expWorkflowSearch = [this.searchFormExpScreenResults.expScreenWorkflow.id];
        }
        //TODO Add back in the RNAi endpoint
        if (!isEmpty(this.searchFormRnaiFormResults.rnaisList)) {
            //TODO The pagination when looking for genes is WONKY
            //So just set teh pageSize to be ridiculously high so that we only return 1 page
            this.expSetSearch.pageSize = 10000;
            this.expSetSearch.rnaiSearch = this.searchFormRnaiFormResults.rnaisList;
            this.expSetSearch.skip = null;
        } else {
            this.expSetSearch.pageSize = 1;
        }

        this.formSubmitted = true;
        this.findExpSets();
    }

    getNewPage(pageNo: number) {
        this.expSets = null;
        this.expSetsModule = null;
        this.expSetSearch.currentPage = pageNo;
        this.formSubmitted = true;
        this.findExpSets();
    }

    findExpSets() {
        this.spinner.show();
        this.expSetApi.getExpSets(this.expSetSearch)
            .subscribe((results) => {
                this.expSets = results.results;

                this.upperPageRange = [];
                this.lowerPageRange = [];
                let pageLimit = this.expSets.currentPage + 4;
                if (pageLimit > this.expSets.totalPages) {
                    pageLimit = this.expSets.totalPages + 1;
                }
                this.lowerPageRange = range(this.expSets.currentPage + 1, pageLimit);
                if (this.expSets.totalPages > this.expSets.currentPage + 4) {
                    this.upperPageRange = range(this.expSets.totalPages - 5, this.expSets.totalPages);
                }

                this.expSetsModule = new ExpsetModule(this.expSets);
                this.expSetsModule.deNormalizeExpSets();
                this.spinner.hide();
            }, (error) => {
                console.log(error);
                this.spinner.hide();
                return new Error(error);
            });

    }
}
