import {NgModule} from '@angular/core';
import {ExtraOptions, RouterModule, Routes} from '@angular/router';

// import {RouterLink, RouterLinkActive} from '@angular/router';
import {PageNotFoundComponent} from './pages/not-found.component';
import {PagesComponent} from './pages/pages.component';
import {RnaiPrimaryComponent} from './exp-screen/upload-screen/rnai/rnai-primary/rnai-primary.component';
import {RnaiPlatePlanComponent} from './exp-screen/upload-screen/rnai/rnai-secondary/rnai-plate-plan/rnai-plate-plan.component';
import {RnaiSecondaryComponent} from './exp-screen/upload-screen/rnai/rnai-secondary/rnai-secondary.component';
import {GeneComponent} from './saved-analysis/exp-set/gene/gene.component';
import {ChemicalPrimaryComponent} from './exp-screen/upload-screen/chemical/chemical-primary/chemical-primary.component';
import {ChemicalSecondaryComponent} from './exp-screen/upload-screen/chemical/chemical-secondary/chemical-secondary.component';
import {ContactSheetComponent} from './scoring/contact-sheet/contact-sheet.component';
import {SearchFormWormsComponent} from './search-forms/search-form-worms/search-form-worms.component';

// TODO Make Routing Modules

const appRoutes: Routes = [
  {path: 'pages', component: PagesComponent},
  {path: 'rnai-primary', component: RnaiPrimaryComponent},
  {path: 'rnai-secondary', component: RnaiSecondaryComponent},
  {path: 'rnai-plate-plan', component: RnaiPlatePlanComponent},
  {path: 'chemical-primary', component: ChemicalPrimaryComponent},
  {path: 'chemical-secondary', component: ChemicalSecondaryComponent},
  {path: 'saved-analysis', component: GeneComponent},
  {path: 'search-worms', component: SearchFormWormsComponent},
  {path: '', redirectTo: '/pages', pathMatch: 'full'},
  {path: '**', component: PageNotFoundComponent},
];

const config: ExtraOptions = {
  enableTracing: false,
  useHash: true,
};

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, config),
  ],
  exports: [RouterModule],
  declarations: []
})

export class AppRoutingModule {
}
