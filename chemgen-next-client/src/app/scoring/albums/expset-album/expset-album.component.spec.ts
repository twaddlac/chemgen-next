import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExpsetAlbumComponent} from './expset-album.component';
import {FormsModule} from '@angular/forms';
import {Lightbox} from 'angular2-lightbox';
import {ModalModule} from "ngx-bootstrap";

describe('ExpsetAlbumComponent', () => {
  let component: ExpsetAlbumComponent;
  let fixture: ComponentFixture<ExpsetAlbumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ExpsetAlbumComponent],
      providers: [{provide: Lightbox}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpsetAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
