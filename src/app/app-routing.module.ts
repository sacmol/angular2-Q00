import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { DiffavvikelseComponent } from './diffavvikelse/diffavvikelse.component';
import { FileComponent } from './file.component';
import { SearchfdiffcomponentComponent } from './searchfdiffcomponent/searchfdiffcomponent.component';
import { SearchufComponent } from './searchuf/searchuf.component';
import { UfavvikelseComponent } from './ufavvikelse/ufavvikelse.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'file' },
  { path: 'file', component: FileComponent},
  { path: 'diffav', component: SearchfdiffcomponentComponent},
  { path: 'diffav/:id', component: DiffavvikelseComponent},
  { path: 'ufav', component: SearchufComponent},
  { path: 'ufav/:id', component: UfavvikelseComponent}
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

}