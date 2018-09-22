import {Component, OnInit, Input, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {ModelPredictedCountsResultSet} from '../../../../../sdk/models';
import {RnaiExpSetApi} from '../../../../../sdk/services/custom';
import {ModalDirective} from 'ngx-bootstrap/modal';
import {Lightbox} from 'angular2-lightbox';

import {get} from 'lodash';

@Component({
  selector: 'app-expset-album-dialog',
  templateUrl: './expset-album-dialog.component.html',
  styleUrls: ['./expset-album-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpsetAlbumDialogComponent implements OnInit {

  @Input('expSet') expSet: any;
  @Input('modelPredictedCounts') modelPredictedCounts: ModelPredictedCountsResultSet;
  @Input('albums') albums: any;
  @Input('score') score: boolean;

  @ViewChild('lgModal') lgModal: ModalDirective;

  expSetAlbums: any = {treatmentReagentImages: [], ctrlReagentImages: [], ctrlNullImages: [], ctrlStrainImages: []};
  public showProgress = false;

  constructor(private rnaiExpSetApi: RnaiExpSetApi, public _lightbox: Lightbox) {
  }

  ngOnInit() {
    // console.log(JSON.stringify(this.expSet, null, 2));
    // TODO Move this to the ExpSet modules
    ['treatmentReagentImages', 'ctrlReagentImages', 'ctrlStrainImages', 'ctrlNullImages'].map((albumName) => {
      if (get(this.expSet, 'albums') && get(this.expSet.albums, albumName)) {
        this.createAlbum(albumName, this.expSet.albums[albumName]);
      }
    });
  }

  getExpSets(counts: ModelPredictedCountsResultSet) {
    this.showProgress = true;
    this.showChildModal();
    this.showProgress = false;
  }

  createAlbum(albumName: string, images: Array<string>) {
    this.expSetAlbums[albumName] = images.map((image: string) => {
      if (image) {
        return {
          src: `http://onyx.abudhabi.nyu.edu/images/${image}-autolevel.jpeg`,
          caption: `Image ${image} caption here`,
          thumb: `http://onyx.abudhabi.nyu.edu/images/${image}-autolevel.jpeg`,
        };
      }
    }).filter((t) => {
      return t;
    });
  }

  showChildModal(): void {
    this.lgModal.show();
  }

  open(album, index: number): void {
    // open lightbox
    this._lightbox.open(album, index);
  }

}
