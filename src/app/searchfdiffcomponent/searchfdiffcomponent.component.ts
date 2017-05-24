import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import {Http, Response, Headers, Request, RequestOptions, RequestMethod, URLSearchParams} from '@angular/http';


import { DiffService } from '../diff/diff.service';

import { Avik } from '../avik';

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
  title = 'DIFF';
  bolag: any = [{id:'1', name:'Folksam'}, {id:'2', name:'Folksam Tjänstemannapension'}, {id:'3', name:'Folksam LOFond'}];
  selectedBol = this.bolag[0];


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
  onlyNumberKey(event) {
    console.log('testing')
    return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
}
  onSelect(avik: Avik): void{
    this._router.navigate(['/diffav', avik.diffId]);

  }
  search(perioden,pnr,fmid,selectedBol){

console.log(perioden,pnr,fmid,selectedBol);

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

      this._diffService.getSearchResultDIFF(perioden,pnr, fmid,selectedBol)

          .subscribe((data:Avik[]) => this.aviks = data,
                error => console.log(error),
                () => console.log('Get all Items completrre',this.aviks));
  }

}
