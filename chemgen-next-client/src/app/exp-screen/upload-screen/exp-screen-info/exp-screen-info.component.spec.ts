import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpScreenInfoComponent} from './exp-screen-info.component';
import {FormsModule} from "@angular/forms";

describe('ExpScreenInfoComponent', () => {
    let component: ExpScreenInfoComponent;
    let fixture: ComponentFixture<ExpScreenInfoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [ExpScreenInfoComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExpScreenInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
