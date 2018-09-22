import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ContactSheetComponent} from './contact-sheet.component';
import {ExpDesignResultSet} from '../../../sdk/models';
import {isEqual} from 'lodash';
import { FormsModule } from '@angular/forms';
import {NouisliderModule} from 'ng2-nouislider';
import {GridAlbumComponent} from '../albums/grid-album/grid-album.component';
import {ExpsetAlbumDialogComponent} from '../albums/expset-album/expset-album-dialog/expset-album-dialog.component';
import {ExpsetAlbumComponent} from '../albums/expset-album/expset-album.component';
import {ModalModule} from 'ngx-bootstrap';
import {ExpManualScoresApi, ExpSetApi} from '../../../sdk/services/custom';
import {Lightbox} from 'angular2-lightbox';

describe('ContactSheetComponent', () => {
  let component: ContactSheetComponent;
  let fixture: ComponentFixture<ContactSheetComponent>;

  // Need to not only declare import, but also all the child imports
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NouisliderModule, ModalModule],
      declarations: [ContactSheetComponent, GridAlbumComponent, ExpsetAlbumDialogComponent, ExpsetAlbumComponent],
      providers: [{provide: ExpSetApi}, {provide: ExpManualScoresApi}, {provide: Lightbox}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should filter expSets', () => {
  //   let expSets = [
  //     [
  //       {
  //         'expDesignId': 54560,
  //         'screenId': 7,
  //         'expWorkflowId': '5af2d6b191f1d80107d9689d',
  //         'treatmentGroupId': 54505,
  //         'controlGroupId': 54543,
  //         'controlGroupReagentType': 'ctrl_null'
  //       },
  //       {
  //         'expDesignId': 54583,
  //         'screenId': 7,
  //         'expWorkflowId': '5af2d6b191f1d80107d9689d',
  //         'treatmentGroupId': 54505,
  //         'controlGroupId': 54553,
  //         'controlGroupReagentType': 'ctrl_rnai'
  //       },
  //       {
  //         'expDesignId': 54616,
  //         'screenId': 7,
  //         'expWorkflowId': '5af2d6b191f1d80107d9689d',
  //         'treatmentGroupId': 54505,
  //         'controlGroupId': 54495,
  //         'controlGroupReagentType': 'ctrl_strain'
  //       }
  //     ]];
  //
  //   // let expGroupId = 123;
  //   const fn = function (expSets: any, expGroupId: number) {
  //     return expSets.filter((expSet: Array<ExpDesignResultSet>) => {
  //       return expSet.filter((expDesignRow: ExpDesignResultSet) => {
  //         return isEqual(expDesignRow.treatmentGroupId, expGroupId) || isEqual(expDesignRow.controlGroupId, expGroupId);
  //       })[0];
  //     })[0];
  //   };
  //
  //   // expect(fn(expSets, 1234)).toBe(true);
  //   // expect(fn(expSets, 54495)).toBe(true);
  //
  // });
});
