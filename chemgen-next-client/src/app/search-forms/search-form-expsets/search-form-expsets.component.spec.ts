import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchFormExpsetsComponent} from './search-form-expsets.component';
import {SDKBrowserModule} from "../../../types/sdk";
import {FormsModule} from "@angular/forms";

describe('SearchFormExpsetsComponent', () => {
    let component: SearchFormExpsetsComponent;
    let fixture: ComponentFixture<SearchFormExpsetsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, SDKBrowserModule.forRoot()],
            declarations: [SearchFormExpsetsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchFormExpsetsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
