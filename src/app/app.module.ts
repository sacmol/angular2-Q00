import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { DiffService } from './diff/diff.service';

import { AppComponent } from './app.component';
import { FileComponent } from './file.component';
import { SearchfdiffcomponentComponent } from './searchfdiffcomponent/searchfdiffcomponent.component';
import { HomeComponent } from './home/home.component';
import { AppRoutingModule } from './app-routing.module';
import { DiffavvikelseComponent } from './diffavvikelse/diffavvikelse.component';
import { UfavvikelseComponent } from './ufavvikelse/ufavvikelse.component';
import { SearchufComponent } from './searchuf/searchuf.component';



@NgModule({
  declarations: [
    AppComponent,
    FileComponent,
    SearchfdiffcomponentComponent,
    HomeComponent,
    DiffavvikelseComponent,
    UfavvikelseComponent,
    SearchufComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [DiffService],
  bootstrap: [AppComponent]
})
export class AppModule { }
