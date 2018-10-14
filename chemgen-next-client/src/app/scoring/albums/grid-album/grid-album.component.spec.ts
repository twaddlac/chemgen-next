import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GridAlbumComponent} from './grid-album.component';
import {FormsModule} from '@angular/forms';
import {ModalModule} from 'ngx-bootstrap';
import {LightboxModule} from 'angular2-lightbox';
import {MockExpsetAlbumComponent, MockExpsetToggleComponent, MockExpsetAlbumDialog} from "../../../../../test/MockComponents";

describe('GridAlbumComponent', () => {
    let component: GridAlbumComponent;
    let fixture: ComponentFixture<GridAlbumComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ModalModule.forRoot(), LightboxModule],
            declarations: [GridAlbumComponent, MockExpsetAlbumComponent, MockExpsetToggleComponent, MockExpsetAlbumDialog],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridAlbumComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
