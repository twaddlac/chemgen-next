import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ExperimentData, ScreenDesign, SearchExpBiosamples} from "../src/app/exp-screen/upload-screen/helpers";

@Component({
    selector: 'app-grid-album',
    template: '<p>Mock Grid Album Component</p>'
})
export class MockGridAlbumComponent {
    @Input('album') album: any;
    @Input('albums') albums: any;
    @Input('score') score: Boolean;
    @Input('plateId') plateId: number;
    @Input('albumType') albumType: string;
    @Input('contactSheetResults') contactSheetResults: any;
    @Input('displayCounts') displayCounts: any;

    @Output() parseInterestingEvent = new EventEmitter<string>();
    @Output() getExpSetsEvent = new EventEmitter<any>();
}

@Component({
    selector: 'app-exp-screen-info',
    template: '<p>Mock Plate Imaging Dates Component</p>'
})
export class MockExpScreenInfoComponent {
    @Input() expDataModel: ExperimentData;
    @Input() expBiosampleModel: SearchExpBiosamples;
}

@Component({
    selector: 'app-plate-imaging-dates',
    template: '<p>Mock Plate Imaging Dates Component</p>'
})
export class MockPlateImagingDatesComponent {
    @Input() plateModel: ScreenDesign;
}
