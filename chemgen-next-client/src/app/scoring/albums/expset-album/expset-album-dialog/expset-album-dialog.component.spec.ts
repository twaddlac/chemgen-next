import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpsetAlbumDialogComponent} from './expset-album-dialog.component';
import {FormsModule} from '@angular/forms';
import {Lightbox, LightboxModule} from 'angular2-lightbox';
import {ModalDirective, ModalModule} from 'ngx-bootstrap';
import {ExpsetAlbumComponent} from '../expset-album.component';
import {ExpSetApi} from '../../../../../sdk/services/custom';
import {ComponentLoaderFactory} from "ngx-bootstrap";
import {SDKBrowserModule} from "../../../../../sdk";

describe('ExpsetAlbumDialogComponent', () => {
  let component: ExpsetAlbumDialogComponent;
  let fixture: ComponentFixture<ExpsetAlbumDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ModalModule.forRoot(), LightboxModule, SDKBrowserModule.forRoot()],
      declarations: [ExpsetAlbumDialogComponent, ExpsetAlbumComponent],
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
