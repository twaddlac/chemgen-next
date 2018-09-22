import { Component, OnInit } from '@angular/core';
import {Input} from '@angular/core';
import {ScreenDesign} from '../helpers';

@Component({
  selector: 'app-plate-imaging-dates',
  templateUrl: './plate-imaging-dates.component.html',
  styleUrls: ['./plate-imaging-dates.component.css']
})
export class PlateImagingDatesComponent implements OnInit {

  @Input() plateModel: ScreenDesign ;

  constructor() { }

  ngOnInit() {
  }

}
