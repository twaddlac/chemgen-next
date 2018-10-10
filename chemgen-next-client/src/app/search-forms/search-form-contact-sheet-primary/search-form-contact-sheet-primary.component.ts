import {Component, OnInit} from '@angular/core';
import {SearchFormViewOptionsResults} from '../../search-forms/search-form-view-options/search-form-view-options.component';
import {SearchFormExpScreenFormResults} from '../../search-forms/search-form-exp-screen/search-form-exp-screen.component';
import {SearchFormRnaiFormResults} from '../../search-forms/search-form-rnai/search-form-rnai.component';
import {isEmpty, isEqual} from 'lodash';
import {ExpSetApi} from '../../../types/sdk/services/custom';
import {NgProgress} from '@ngx-progressbar/core';
import {NgxSpinnerService} from "ngx-spinner";
import {ExpSetSearchResults, ExpSetSearch} from "../../../types/custom/ExpSetTypes";
import {ExpsetModule} from "../../scoring/expset/expset.module";

/**
 * This is the search form to get the screens by Plate
 */
@Component({
    // selector: 'app-search-form-contact-sheet-primary',
    templateUrl: './search-form-contact-sheet-primary.component.html',
    styleUrls: ['./search-form-contact-sheet-primary.component.css']
})
export class SearchFormContactSheetPrimaryComponent implements OnInit {
    searchFormExpScreenResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();
    searchFormRnaiFormResults: SearchFormRnaiFormResults = new SearchFormRnaiFormResults();
    expSetSearch: ExpSetSearch = new ExpSetSearch();

    public expSets: ExpSetSearchResults = null;
    public expSetsModule: ExpsetModule;
    public formSubmitted: boolean = false;

    public expSetView = true;

    constructor(private expSetApi: ExpSetApi, private spinner: NgxSpinnerService) {
        this.expSetSearch.currentPage = 1;
    }

    ngOnInit() {
    }

    getNewExpSets() {
        // this.showProgress = false;
        this.onSubmit();
    }

    onSubmit() {
        this.formSubmitted = false;
        this.expSets = null;
        this.expSetSearch.pageSize = 1;
        this.expSetSearch.ctrlLimit = 20;
        if (this.searchFormExpScreenResults.expScreen) {
            this.expSetSearch.screenSearch = [this.searchFormExpScreenResults.expScreen.screenId];
        }

        if (this.searchFormExpScreenResults.expScreenWorkflow) {
            this.expSetSearch.expWorkflowSearch = [this.searchFormExpScreenResults.expScreenWorkflow.id];
        }

        this.spinner.show();
        this.expSetApi.getUnScoredExpSetsByPlate(this.expSetSearch)
            .toPromise()
            .then((results) => {
                this.formSubmitted = true;
                console.log('got contactSheetResults');
                this.spinner.hide();
                this.expSets = results.results;
            })
            .catch((error) => {
                this.spinner.hide();
                console.log(error);
                return new Error(error);
            });

    }

}
