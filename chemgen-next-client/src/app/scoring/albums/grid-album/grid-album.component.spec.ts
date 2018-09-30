import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GridAlbumComponent} from './grid-album.component';
import {FormsModule} from '@angular/forms';
import {ExpsetAlbumDialogComponent} from '../expset-album/expset-album-dialog/expset-album-dialog.component';
import {ExpsetAlbumComponent} from '../expset-album/expset-album.component';
import {ModalModule} from 'ngx-bootstrap';
import {Lightbox, LightboxConfig, LightboxModule} from 'angular2-lightbox';

describe('GridAlbumComponent', () => {
  let component: GridAlbumComponent;
  let fixture: ComponentFixture<GridAlbumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ModalModule.forRoot(), LightboxModule],
      declarations: [GridAlbumComponent, ExpsetAlbumDialogComponent, ExpsetAlbumComponent],
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
