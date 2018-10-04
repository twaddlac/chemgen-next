import {Component, OnInit, Input, Renderer2, Output} from '@angular/core';
import {ExpManualScoresApi} from "../../../sdk/services/custom";
import {ExpManualScoresResultSet, ExpScreenResultSet, ExpScreenUploadWorkflowResultSet} from "../../../sdk/models";
import {ContactSheetComponent} from "../contact-sheet/contact-sheet.component";
import {get, find, isEqual} from 'lodash';

@Component({
    selector: 'app-expset-toggle',
    templateUrl: './expset-toggle.component.html',
    styleUrls: ['./expset-toggle.component.css']
})
export class ExpsetToggleComponent implements OnInit {
    @Input() expScreen: ExpScreenResultSet;
    @Input() expWorkflow: ExpScreenUploadWorkflowResultSet;
    @Input() treatmentGroupId: number;
    @Input() assayId: any = null;
    @Input() results: any;
    @Input() expManualScores: ExpManualScoresResultSet[] = [];
    //For the contact sheet we want to submit all as one batch as opposed to in real time
    @Input() submit: boolean = true;
    public error: any;
    public userName: string;
    public userId: string | number;

    constructor(private expManualScoresApi: ExpManualScoresApi, private renderer: Renderer2) {
        const userName = document.getElementById('userName');
        const userId = document.getElementById('userId');
        this.userName = userName.innerText || 'dummyUser';
        this.userId = userId.innerText || 0;
        this.submit = true;
    }

    ngOnInit() {
        if (!this.results) {
            this.results = {};
            this.results[this.treatmentGroupId] = false;
        } else if (this.results && !get(this.results, this.treatmentGroupId)) {
            this.results[this.treatmentGroupId] = false;
        }
        this.getManualScores();
    }

    setManualScores() {
        if (this.submit) {
            let manualScoreValue = 0;
            if (this.results[this.treatmentGroupId]) {
                manualScoreValue = 1;
            }
            let score = {
                'manualscoreGroup': 'FIRST_PASS',
                'manualscoreCode': 'FIRST_PASS_INTERESTING',
                'manualscoreValue': manualScoreValue,
                'screenId': this.expScreen.screenId,
                'screenName': this.expScreen.screenName,
                'assayId': this.assayId,
                'treatmentGroupId': this.treatmentGroupId,
                'scoreCodeId': 66,
                'userId': this.userId,
                'userName': this.userName,
                'expWorkflowId': String(this.expWorkflow.id),
            };
            this.submitScores([score]);
        }
    }

    submitScores(manualScores) {
        this.expManualScoresApi
            .submitScores(manualScores)
            .subscribe(() => {

            }, (error) => {
                this.error(error);
            })
    }

    getManualScores() {
        const filterExpManualScores = function (results) {
            if (find(results, (result) => {
                return isEqual(result.manualscoreGroup, 'FIRST_PASS') && isEqual(result.manualscoreValue, 1);
            })) {
                return true;
            } else {
                return false;
            }
        };
        if (this.expManualScores && this.expManualScores.length) {
            this.results[this.treatmentGroupId] = filterExpManualScores(this.expManualScores)
        } else {
            let where: any = {and: [{'manualscoreGroup': 'FIRST_PASS'}]};
            if (this.assayId) {
                where.and.push({assayId: this.assayId});
            } else if (this.treatmentGroupId) {
                where.and.push({treatmentGroupId: this.treatmentGroupId});
            } else {
                this.error = "No Treatment Group or Assay Id specified!";
            }
            this.expManualScoresApi
                .find({
                    where: where
                })
                .subscribe((results: ExpManualScoresResultSet[]) => {
                    this.results[this.treatmentGroupId] = filterExpManualScores(results);
                }, (error) => {
                    this.error(error.toString());
                })
        }
    }

}
