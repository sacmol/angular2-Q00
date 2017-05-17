import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { Avik } from '../avik';

import { Notering } from'../notering';

import { Observable } from 'rxjs/Observable';

import { DiffService } from '../diff/diff.service';

@Component({
  selector: 'app-diffavvikelse',
  templateUrl: './diffavvikelse.component.html',
  styleUrls: ['./diffavvikelse.component.css']
})
export class DiffavvikelseComponent implements OnInit {

  @Input() diffavvikelse: Avik;

  notering: Notering;
  data: string;
  svarsmeddelande: string;
  id: any;
  constructor(private _diffService: DiffService, private _route: ActivatedRoute) { }

  getDiffAvvikelse(){

    // this._diffService.getDiffAvvikelse(this.id)
    // .subscribe(diffavvikelse => this.diffavvikelse = diffavvikelse);

    this._diffService.getDiffAvvikelse(this.id).
    then(diffavvikelse => this.diffavvikelse = diffavvikelse);
    
   
  }

  ngOnInit(){
    this.id = this._route.snapshot.params['id'];
    this.getDiffAvvikelse();

  }

  uppdaterAvvikelse(kategori,ansvarig,status,notering){

    this.svarsmeddelande = 'Processerar......';
    console.log('uppdateraXXXXXXXXXX',kategori,ansvarig,status,notering);
    this.diffavvikelse.status = status;
    this.diffavvikelse.kategori = kategori;
    this.diffavvikelse.ansvarig = ansvarig;
    this.diffavvikelse.notering.text = notering;
    
 this._diffService.uppdateraDiff(this.diffavvikelse)
    .then(diffavvikelse => this.diffavvikelse = diffavvikelse);
//  .then(result => console.log(result,'sasa'))
          // .catch(error => console.log(error));
    // .subscribe(data => this.data = JSON.stringify(data));
    // .subscribe((data) => this.diffspec = data,
    //             error => console.log(error),
    //             () => console.log('ALLt klart ju',this.diffspec));

    this.svarsmeddelande = 'Klart';
  }
  uppdaterAvvikelseMedNotering(kategori,ansvarig,status,notering){

      this.notering = {
            noteringid: null,
            period: '22',
            fmId: '22',
            personnummer: '22',
            felLista: 'DIFF',
            felTyp: '22',
            text: '22'
      }
      this.notering.text = notering;
      this.notering.fmId = this.diffavvikelse.fmId;
      this.notering.personnummer = this.diffavvikelse.personnummer;
      this.diffavvikelse.notering = this.notering;
      this.diffavvikelse.status = status;
      this.diffavvikelse.kategori = kategori;
      this.diffavvikelse.ansvarig = ansvarig;
      console.log(this.diffavvikelse);
      console.log(this.notering);
      this._diffService.uppdateraDiff(this.diffavvikelse)
    .then(diffavvikelse => this.diffavvikelse = diffavvikelse);
    this.svarsmeddelande = 'Skapad';
  }
}
