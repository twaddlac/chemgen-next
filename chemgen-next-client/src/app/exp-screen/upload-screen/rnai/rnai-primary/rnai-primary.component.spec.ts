import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Component, Input} from "@angular/core";
import {RnaiPrimaryComponent} from './rnai-primary.component';
import {FormsModule} from "@angular/forms";
import {ExperimentData, ScreenDesign, SearchExpBiosamples} from "../../helpers";
import {DndModule, DragDropConfig, DragDropService, DragDropSortableService} from "ng2-dnd";
import {
    ExpScreenApi,
    ExpScreenUploadWorkflowApi,
    ReagentLibraryApi,
    SDKModels
} from "../../../../../types/sdk/services/custom";
import {HttpClient, HttpHandler} from "@angular/common/http";
import {ErrorHandler, LoopBackAuth} from "../../../../../types/sdk/services/core";
import {SocketConnection} from "../../../../../types/sdk/sockets/socket.connections";
import {SocketDriver} from "../../../../../types/sdk/sockets/socket.driver";
import {InternalStorage, SDKBrowserModule} from "../../../../../types/sdk";

@Component({
    selector: 'app-exp-screen-info',
    template: '<p>Mock Plate Imaging Dates Component</p>'
})
class MockExpScreenInfoComponent {
    @Input() expDataModel: ExperimentData;
    @Input() expBiosampleModel: SearchExpBiosamples;
}

@Component({
    selector: 'app-plate-imaging-dates',
    template: '<p>Mock Plate Imaging Dates Component</p>'
})
class MockPlateImagingDatesComponent {
    @Input() plateModel: ScreenDesign;
}

describe('RnaiPrimaryComponent', () => {
    let component: RnaiPrimaryComponent;
    let fixture: ComponentFixture<RnaiPrimaryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, DndModule.forRoot(), SDKBrowserModule.forRoot()],
            declarations: [RnaiPrimaryComponent, MockExpScreenInfoComponent, MockPlateImagingDatesComponent],
            // providers: [DragDropSortableService, DragDropService, DragDropConfig, ReagentLibraryApi, ExpScreenUploadWorkflowApi, ExpScreenApi,
            //     HttpClient, HttpHandler, ErrorHandler, SocketConnection, SocketDriver, SDKModels, LoopBackAuth, InternalStorage]
            // providers: [DragDropSortableService, DragDropService, DragDropConfig, ReagentLibraryApi, ExpScreenUploadWorkflowApi, ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RnaiPrimaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
