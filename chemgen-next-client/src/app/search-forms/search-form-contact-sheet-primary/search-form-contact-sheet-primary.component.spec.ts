import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchFormContactSheetPrimaryComponent} from './search-form-contact-sheet-primary.component';
import {SDKBrowserModule} from "../../../types/sdk";
import {FormsModule} from "@angular/forms";
import {MockSearchFormExpScreen, MockContactSheetComponent} from "../../../../test/MockComponents";
import {NgxSpinnerModule} from "ngx-spinner";

describe('SearchFormContactSheetPrimaryComponent', () => {
    let component: SearchFormContactSheetPrimaryComponent;
    let fixture: ComponentFixture<SearchFormContactSheetPrimaryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot(), NgxSpinnerModule],
            declarations: [SearchFormContactSheetPrimaryComponent, MockSearchFormExpScreen, MockContactSheetComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchFormContactSheetPrimaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
