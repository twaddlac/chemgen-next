import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Injectable} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';

import {HttpClientModule} from '@angular/common/http';
import {AppComponent} from './app.component';

import {PagesModule} from './pages/pages.module';

import {PageNotFoundComponent} from './pages/not-found.component';

import {SDKBrowserModule} from '../sdk';
import {LoopBackConfig} from '../sdk';

import {RnaiPrimaryComponent} from './exp-screen/upload-screen/rnai/rnai-primary/rnai-primary.component';
import {RnaiSecondaryComponent} from './exp-screen/upload-screen/rnai/rnai-secondary/rnai-secondary.component';
import {ExpScreenInfoComponent} from './exp-screen/upload-screen/exp-screen-info/exp-screen-info.component';
import {PlateImagingDatesComponent} from './exp-screen/upload-screen/plate-imaging-dates/plate-imaging-dates.component';
import {RnaiPlatePlanComponent} from './exp-screen/upload-screen/rnai/rnai-secondary/rnai-plate-plan/rnai-plate-plan.component';

import {ChemicalSecondaryComponent} from './exp-screen/upload-screen/chemical/chemical-secondary/chemical-secondary.component';
import {ChemicalPrimaryComponent} from './exp-screen/upload-screen/chemical/chemical-primary/chemical-primary.component';
import {GridAlbumComponent} from './scoring/albums/grid-album/grid-album.component';
import {ExpsetAlbumComponent} from './scoring/albums/expset-album/expset-album.component';


import {SearchFormExpScreenComponent} from './search-forms/search-form-exp-screen/search-form-exp-screen.component';
import {SearchFormRnaiComponent} from './search-forms/search-form-rnai/search-form-rnai.component';
import {SearchFormChemicalComponent} from './search-forms/search-form-chemical/search-form-chemical.component';
import {ContactSheetComponent} from './scoring/contact-sheet/contact-sheet.component';

import {TypeaheadModule} from 'ngx-bootstrap/typeahead';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {ModalModule} from 'ngx-bootstrap/modal';
import {NgProgressModule} from '@ngx-progressbar/core';
import {LoadingModule} from 'ngx-loading';
import {BsDatepickerModule} from 'ngx-bootstrap';
import {DndModule} from 'ng2-dnd';
import {LightboxModule} from 'angular2-lightbox';
import {NouisliderModule} from 'ng2-nouislider';
import {SearchFormViewOptionsComponent} from './search-forms/search-form-view-options/search-form-view-options.component';

import {ExpsetAlbumDialogComponent} from './scoring/albums/expset-album/expset-album-dialog/expset-album-dialog.component';
import {SearchFormWormsComponent} from './search-forms/search-form-worms/search-form-worms.component';
import {ExpsetSheetComponent} from './scoring/expset-sheet/expset-sheet.component';
// import {NgxToggleModule} from 'ngx-toggle';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {EmptyComponent} from './empty/empty.component';

@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
        PagesModule,
        HttpClientModule,
        FormsModule,
        BsDatepickerModule.forRoot(),
        DndModule.forRoot(),
        SDKBrowserModule.forRoot(),
        ModalModule.forRoot(),
        BsDropdownModule.forRoot(),
        TooltipModule.forRoot(),
        TypeaheadModule.forRoot(),
        NgProgressModule.forRoot({}),
        LightboxModule,
        NouisliderModule,
        LoadingModule,
    ],
    declarations: [
        AppComponent,
        PageNotFoundComponent,
        RnaiPrimaryComponent,
        RnaiSecondaryComponent,
        ExpScreenInfoComponent,
        PlateImagingDatesComponent,
        RnaiPlatePlanComponent,
        ChemicalSecondaryComponent,
        ChemicalPrimaryComponent,
        GridAlbumComponent,
        ExpsetAlbumComponent,
        SearchFormExpScreenComponent,
        SearchFormRnaiComponent,
        SearchFormChemicalComponent,
        ContactSheetComponent,
        SearchFormViewOptionsComponent,
        ExpsetAlbumDialogComponent,
        SearchFormWormsComponent,
        ExpsetSheetComponent,
        EmptyComponent,
    ],
    entryComponents: [
        // ExpsetAlbumComponent,
    ],
    providers: [],
    // exports: [ExpsetAlbumComponent],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {
        // TODO Need to add this to an environmental variables
        LoopBackConfig.setBaseURL('http://10.230.9.227:3000');
        // LoopBackConfig.setBaseURL('http://localhost:3000');
        LoopBackConfig.setApiVersion('api');
    }
}
