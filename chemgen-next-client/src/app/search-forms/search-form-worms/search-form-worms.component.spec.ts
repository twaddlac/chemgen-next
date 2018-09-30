import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchFormWormsComponent} from './search-form-worms.component';
import {SearchFormExpScreenComponent} from '../search-form-exp-screen/search-form-exp-screen.component';
import {SearchFormRnaiComponent} from '../search-form-rnai/search-form-rnai.component';
import {SearchFormViewOptionsComponent} from '../search-form-view-options/search-form-view-options.component';
import {LoadingModule} from 'ngx-loading';
import {ContactSheetComponent} from '../../scoring/contact-sheet/contact-sheet.component';
import {ExpsetSheetComponent} from '../../scoring/expset-sheet/expset-sheet.component';
import {FormsModule} from '@angular/forms';
import {NouisliderModule} from 'ng2-nouislider';
import {GridAlbumComponent} from '../../scoring/albums/grid-album/grid-album.component';
import {ExpsetAlbumComponent} from '../../scoring/albums/expset-album/expset-album.component';
import {ExpsetAlbumDialogComponent} from '../../scoring/albums/expset-album/expset-album-dialog/expset-album-dialog.component';
import {ModalModule} from 'ngx-bootstrap';
import {ExpScreenApi, ExpScreenUploadWorkflowApi, ExpSetApi, SDKModels} from '../../../sdk/services/custom';
import {NgProgress, NgProgressModule} from '@ngx-progressbar/core';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {SocketConnection} from '../../../sdk/sockets/socket.connections';
import {SocketDriver} from '../../../sdk/sockets/socket.driver';
import {ErrorHandler, LoopBackAuth} from '../../../sdk/services/core';
import {InternalStorage} from '../../../sdk';

describe('SearchFormWormsComponent', () => {
    let component: SearchFormWormsComponent;
    let fixture: ComponentFixture<SearchFormWormsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [LoadingModule, FormsModule, NouisliderModule, ModalModule, NgProgressModule],
            declarations: [SearchFormWormsComponent, SearchFormExpScreenComponent,
                SearchFormRnaiComponent, SearchFormViewOptionsComponent, ContactSheetComponent,
                ExpsetSheetComponent, GridAlbumComponent, ExpsetAlbumComponent, ExpsetAlbumDialogComponent],
            providers: [ExpSetApi, ExpScreenApi, ExpScreenUploadWorkflowApi,
                HttpClient, HttpHandler, SocketConnection, SocketDriver, SDKModels, LoopBackAuth, InternalStorage, ErrorHandler]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchFormWormsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
