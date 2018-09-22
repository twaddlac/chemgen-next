import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpsetSheetComponent } from './expset-sheet.component';
import {FormsModule} from '@angular/forms';
import {ExpsetAlbumComponent} from '../albums/expset-album/expset-album.component';
import {ExpsetAlbumDialogComponent} from '../albums/expset-album/expset-album-dialog/expset-album-dialog.component';
import {ModalModule} from 'ngx-bootstrap';

describe('ExpsetSheetComponent', () => {
  let component: ExpsetSheetComponent;
  let fixture: ComponentFixture<ExpsetSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ModalModule],
      declarations: [ ExpsetSheetComponent, ExpsetAlbumComponent, ExpsetAlbumDialogComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpsetSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
