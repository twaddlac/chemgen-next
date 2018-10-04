import {Component, OnInit, Output, Input, ChangeDetectionStrategy} from '@angular/core';
import {ExpScreenApi, ExpScreenUploadWorkflowApi} from '../../../sdk/services/custom';
import {ExpScreenResultSet, ExpScreenUploadWorkflowResultSet} from '../../../sdk/models';
// import {TypeaheadMatch} from 'ngx-bootstrap/typeahead';
import {uniq, orderBy} from 'lodash';

@Component({
    selector: 'app-search-form-exp-screen',
    templateUrl: './search-form-exp-screen.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./search-form-exp-screen.component.css']
})
export class SearchFormExpScreenComponent implements OnInit {

    expScreens: ExpScreenResultSet[];
    expScreenWorkflows: ExpScreenUploadWorkflowResultSet[];
    temperatures: Array<number>;
    // expScreenFormResults: SearchFormExpScreenFormResults = new SearchFormExpScreenFormResults();

    @Input('formResults') formResults: SearchFormExpScreenFormResults;

    constructor(private expScreenApi: ExpScreenApi, private expScreenUploadWorkflowApi: ExpScreenUploadWorkflowApi) {
        this.expScreens = [];
        this.expScreenWorkflows = [];
        this.temperatures = [];
        this.getExpScreens();
    }

    ngOnInit() {
    }

    getExpScreens() {
        this.expScreenApi
            .find()
            .subscribe((results: ExpScreenResultSet[]) => {
                this.expScreens = results;
                return;
            }, (error) => {
                console.log(error);
                return new Error(error);
            });
    }

    getExpScreenWorkflows() {
        this.expScreenWorkflows = [];
        this.formResults.expScreenWorkflow = null;
        const where: any = {
            screenName: this.formResults.expScreen.screenName
        };
        this.expScreenUploadWorkflowApi
            .find({
                where: where,
                fields: {
                    id: true,
                    screenId: true,
                    temperature: true,
                    screenName: true,
                    assayDates: true,
                    name: true,
                },
            })
            .subscribe((results: ExpScreenUploadWorkflowResultSet[]) => {
                this.expScreenWorkflows = orderBy(results, 'name');
                this.temperatures = results.map((result) => {
                    return result.temperature;
                });
                this.temperatures = uniq(this.temperatures);
                return;
            });

    }
}

export class SearchFormExpScreenFormResults {
    expScreen ?: ExpScreenResultSet;
    expScreenWorkflow ?: ExpScreenUploadWorkflowResultSet;
    temperatures ?: Array<number>;
}
