import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {PagesComponent} from './pages.component';

import {PagesRoutingModule} from './pages-routing.module';

import { RouterModule } from '@angular/router'; // we also need angular router for Nebular to function properly

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PagesRoutingModule,
  ],
  declarations: [
    PagesComponent
  ],
  providers: []
})
export class PagesModule {
}
