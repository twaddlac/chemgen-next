import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Input} from '@angular/core';
import {ModelPredictedCountsResultSet} from '../../../../types/sdk/models';
import {Lightbox} from 'angular2-lightbox';

import {isEmpty} from 'lodash';

@Component({
    selector: 'app-expset-album',
    templateUrl: './expset-album.component.html',
    styleUrls: ['./expset-album.component.css'],
    providers: [],
})

export class ExpsetAlbumComponent implements OnInit {
    @Input('expSet') expSet: any;
    @Input('albums') albums: any;
    @Input('score') score: boolean;
    @Input('expSetAlbums') expSetAlbums: any;
    @Input('contactSheetResults') contactSheetResults: any = {interesting: {}};

    constructor(public _lightbox: Lightbox) {
    }

    ngOnInit() {
    }

    open(album, index: number): void {
        // open lightbox
        this._lightbox.open(album, index);
    }

}
