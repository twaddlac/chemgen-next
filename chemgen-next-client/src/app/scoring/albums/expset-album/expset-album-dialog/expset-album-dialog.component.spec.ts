import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpsetAlbumDialogComponent} from './expset-album-dialog.component';
import {FormsModule} from '@angular/forms';
import {Lightbox} from 'angular2-lightbox';
import {ModalDirective, ModalModule} from 'ngx-bootstrap';
import {ExpsetAlbumComponent} from '../expset-album.component';
import {RnaiExpSetApi} from '../../../../../sdk/services/custom';

describe('ExpsetAlbumDialogComponent', () => {
  let component: ExpsetAlbumDialogComponent;
  let fixture: ComponentFixture<ExpsetAlbumDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ModalModule],
      declarations: [ExpsetAlbumDialogComponent, ExpsetAlbumComponent],
      providers: [{provide: Lightbox}, {provide: RnaiExpSetApi}, {provide: ModalDirective}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpsetAlbumDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
