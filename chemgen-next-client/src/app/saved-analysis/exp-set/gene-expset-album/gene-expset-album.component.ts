import {Component, OnInit} from '@angular/core';
import {Input} from '@angular/core';

@Component({
  selector: 'app-gene-expset-album',
  templateUrl: './gene-expset-album.component.html',
  styleUrls: ['./gene-expset-album.component.css']
})
export class GeneExpsetAlbumComponent implements OnInit {

  @Input('album') album: Array<any>;
  @Input('expSet') expSet: Array<any>;
  @Input('title') title: string;

  constructor() {
  }

  ngOnInit() {
  }

}
