import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import {Http, Response, Headers, Request, RequestOptions, RequestMethod, URLSearchParams} from '@angular/http';


import { DiffService } from '../diff/diff.service';

import { Avik } from '../avik';

import { Ufavik } from '../ufavik';

import { Observable } from 'rxjs/Observable';

@Component({
  // moduleId: module.id,
  selector: 'diff',
  templateUrl: './searchfdiffcomponent.component.html',
  styleUrls: ['./searchfdiffcomponent.component.css'],
  // providers: []
})
export class SearchfdiffcomponentComponent implements OnInit {
 
  aviks: Avik[];
  avik: Avik;
  ufaviks: Ufavik[];
  ufIsValid: boolean;
  avikIsValid: boolean;
  title = 'DIFF';
  testData: string;
  avvikelseTyp:Array<string> = ['UF','DIFF'];
   bolag: any = [{id:'1', name:'Folksam'}, {id:'2', name:'Folksam Tjänstemannapension'}, {id:'3', name:'Folksam LOFond'}];
  items: any = [{name:'a', rate:20}, {name:'b', rate:36}, {name:'c', rate:42}];
  selectedBol = this.bolag[0];
  selectedVal = this.avvikelseTyp[0];

  constructor(private _diffService: DiffService, private _router: Router) {
   }

  ngOnInit() {
  }

  DiffDtoTest(){   
    this._diffService.getDiffDtoTest()
  
       .subscribe((data:Avik[]) => this.aviks = data,
                error => console.log(error),
                () => console.log('Get all Items complete',this.aviks));
  }

  onSelect(avik: Avik): void{
    this._router.navigate(['/diffav', avik.diffId]);

  }
  search(perioden,pnr,fmid,selectedVal,selectedBol){

console.log(perioden,pnr,fmid,selectedVal,selectedBol);

let params: URLSearchParams = new URLSearchParams();
params.set('param1', pnr);
params.set('param2', fmid);
    //  let params = new URLSearchParams();
    // for(let key in data) {
    //     params.set(key, data[key]);
    // }
    let options = new RequestOptions({
        search: params
    });

    if(selectedVal === 'UF'){
      this.avikIsValid = false;
      this.ufIsValid = true;
      this._diffService.getSearchResultUF(perioden,pnr,fmid,selectedBol)

          .subscribe((data:Ufavik[]) => this.ufaviks = data,
                error => console.log(error),
                () => console.log('Get all UF Items complete',this.ufaviks));
    //   .subscribe(
    //     data => this.testData = JSON.stringify(data),
    //    error => alert(error),
    //     () => console.log("MolinUF")
     
    //  );

  }else{
    this.avikIsValid = true;
      this.ufIsValid = false;
      this._diffService.getSearchResultDIFF(perioden,pnr, fmid,selectedBol)

          .subscribe((data:Avik[]) => this.aviks = data,
                error => console.log(error),
                () => console.log('Get all Items completrre',this.aviks));
    //   .subscribe(
    //     data => this.testData = JSON.stringify(data),
    //     error => alert(error),
    //     () => console.log("MolinDIFF")
     
    //  );
    }
  }



}
