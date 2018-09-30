import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, Input, Output, EventEmitter} from "@angular/core";

import {ChemicalSecondaryComponent} from './chemical-secondary.component';
import {FormsModule} from "@angular/forms";
import {ScreenDesign} from "../../helpers";
import {ExperimentData} from "../../helpers";
import {SearchExpBiosamples} from "../../helpers";
import {DndModule, DragDropConfig, DragDropService, DragDropSortableService} from "ng2-dnd";
import {
    ExpBiosampleApi, ExpScreenApi,
    ExpScreenUploadWorkflowApi,
    PlateApi, PlatePlan96Api,
    ReagentLibraryApi,
    SDKModels
} from "../../../../../sdk/services/custom";
import {HttpClient, HttpHandler} from "@angular/common/http";
import {SocketConnection} from "../../../../../sdk/sockets/socket.connections";
import {SocketDriver} from "../../../../../sdk/sockets/socket.driver";
import {ErrorHandler, LoopBackAuth} from "../../../../../sdk/services/core";
import {InternalStorage, SDKBrowserModule} from "../../../../../sdk";

@Component({
    selector: 'app-plate-imaging-dates',
    template: '<p>Mock Plate Imaging Dates Component</p>'
})
class MockPlateImagingDatesComponent {
    @Input() plateModel: ScreenDesign;
}

@Component({
    selector: 'app-exp-screen-info',
    template: '<p>Mock Plate Imaging Dates Component</p>'
})
class MockExpScreenInfoComponent {
    @Input() expDataModel: ExperimentData;
    @Input() expBiosampleModel: SearchExpBiosamples;
}

describe('ChemicalSecondaryComponent', () => {
    let component: ChemicalSecondaryComponent;
    let fixture: ComponentFixture<ChemicalSecondaryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, DndModule.forRoot(), SDKBrowserModule.forRoot()],
            declarations: [ChemicalSecondaryComponent, MockExpScreenInfoComponent, MockPlateImagingDatesComponent],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChemicalSecondaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
