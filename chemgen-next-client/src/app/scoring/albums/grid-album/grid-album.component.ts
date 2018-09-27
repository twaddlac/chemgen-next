import {Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {isEqual} from 'lodash';
import {Lightbox} from 'angular2-lightbox';

@Component({
    selector: 'app-grid-album',
    templateUrl: './grid-album.component.html',
    styleUrls: ['./grid-album.component.css'],
})
export class GridAlbumComponent implements OnInit {

    @Input('album') album: any;
    @Input('albums') albums: any;
    @Input('score') score: Boolean;
    @Input('plateId') plateId: number;
    @Input('albumType') albumType: string;
    @Input('contactSheetResults') contactSheetResults: any;
    @Input('displayCounts') displayCounts: any;

    @Output() parseInterestingEvent = new EventEmitter<string>();
    @Output() getExpSetsEvent = new EventEmitter<any>();

    constructor(public _lightbox: Lightbox) {
    }

    ngOnInit() {
    }

    /**
     * This emits an event to the child-plate-component to parseInteresting!
     * @param event
     */
    parseInterestingWatcher(event) {
        console.log('should be emitting event....');
        // this.parseInterestingEvent.emit(event);
    }

    getExpSetsWatcher(counts) {
        this.getExpSetsEvent.emit(counts);
    }

    remove(album, index: number): void {
        this.albums.removed.push(album.splice(index, 1)[0]);
    }

    open(album, index: number): void {
        // open lightbox
        this._lightbox.open(album, index);
    }

    scoreThis(image: any) {
        if (isEqual(this.score, false)) {
            return '';
        } else if (isEqual(this.contactSheetResults.interesting[image.treatmentGroupId], true)) {
            return 'interesting';
        } else {
            return 'not_interesting';
        }
    }

}
