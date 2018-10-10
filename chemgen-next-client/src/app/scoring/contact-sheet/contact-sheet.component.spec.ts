import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, Input, Output, EventEmitter} from "@angular/core";
import {By} from "@angular/platform-browser";

import {ContactSheetComponent} from './contact-sheet.component';
import {FormsModule} from '@angular/forms';
import {NouisliderModule} from 'ng2-nouislider';
import {ModalModule} from 'ngx-bootstrap';
import {ExpManualScoresApi, ExpSetApi} from '../../../types/sdk/services/custom';
import {Lightbox} from 'angular2-lightbox';
import {ComponentLoaderFactory} from "ngx-bootstrap";
import {expSetMockData} from "../../../../test/ExpSet.mock";
import {BsModalService} from "ngx-bootstrap";
import {ModalDirective} from "ngx-bootstrap";
import {DebugElement} from "@angular/core";

@Component({
    selector: 'app-grid-album',
    template: '<p>Mock Grid Album Component</p>'
})
class MockGridAlbumComponent {
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

describe('ContactSheetComponent', () => {
    let component: ContactSheetComponent;
    let fixture: ComponentFixture<ContactSheetComponent>;
    let expSetsEl: DebugElement;

    // Need to not only declare import, but also all the child imports
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, NouisliderModule, ModalModule.forRoot()],
            declarations: [ContactSheetComponent, MockGridAlbumComponent],
            providers: [{provide: ExpSetApi}, {provide: ExpManualScoresApi}, {provide: Lightbox}, {provide: ComponentLoaderFactory}]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ContactSheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create with expSetData', () => {
        //TODO need to test this with real data
        component.expSets = expSetMockData;
        //I'm not totally sure why applying detectChanges() does not reinitialize ngOnInit
        fixture.detectChanges();
        expect(component.contactSheetResults.interesting[30456]).toBeFalsy();
        // component.parseExpSetsToAlbums();
        // expect(component.contactSheetResults.interesting[30456]).toBeFalsy();
        expect(component).toBeTruthy();
    });

    it('should removeInteresting()', () => {
        component.expSets = expSetMockData;
        fixture.detectChanges();
        component.contactSheetResults.interesting[30456] = true;
        component.removeByTreatmentGroupId(30456);
        console.log(JSON.stringify(component.contactSheetResults));
        expect(component).toBeTruthy();
    });

    it('should changePhenotypeSlider', () => {

    });
});
