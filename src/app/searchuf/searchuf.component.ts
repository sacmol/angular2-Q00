import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {Http, Response, Headers, Request, RequestOptions, RequestMethod, URLSearchParams} from '@angular/http';

import { DiffService } from '../diff/diff.service';

import { Ufavik } from '../ufavik';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-searchuf',
  templateUrl: './searchuf.component.html',
  styleUrls: ['./searchuf.component.css']
})
export class SearchufComponent implements OnInit {
title = 'UF';
ufavvikelser: Ufavik[];
ufavikelse: Ufavik;
bolag: any = [{id:'1', name:'Folksam'}, {id:'2', name:'Folksam Tjänstemannapension'}, {id:'3', name:'Folksam LOFond'}];
selectedBol = this.bolag[0];
  constructor(private _diffService: DiffService, private _router: Router) { }

  ngOnInit() {
  }

search(period,pnr,fmid,selectedBol){
  console.log('QQAQQ',period,pnr,fmid,selectedBol);

  this._diffService.getSearchResultUF(period,pnr,fmid,selectedBol)
  .subscribe((data:Ufavik[]) => this.ufavvikelser = data,
                error => console.log(error),
                () => console.log('Get all UF Items complete',this.ufavvikelser));
}

 onSelect(ufavikelse: Ufavik): void{
    this._router.navigate(['/ufav', ufavikelse.ufId]);

  }
}
