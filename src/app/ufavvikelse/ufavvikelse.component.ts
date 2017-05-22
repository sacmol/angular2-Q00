import { Component, OnInit, Input } from '@angular/core';

import { Router, ActivatedRoute} from '@angular/router';

import { DiffService } from '../diff/diff.service';

import { Notering } from'../notering';

import { Ufavik } from '../ufavik';

@Component({
  selector: 'app-ufavvikelse',
  templateUrl: './ufavvikelse.component.html',
  styleUrls: ['./ufavvikelse.component.css']
})
export class UfavvikelseComponent implements OnInit {

  @Input() ufavvikelse: Ufavik;
   notering: Notering;
  svarsmeddelande: string;
  // statusar: any = [{id:'DEF', name:'DEF'},{id:'NY', name:'NY'}, {id:'PÅGÅR', name:'PÅGÅR'}, {id:'BEVAKAS', name:'BEVAKAS'},{id:'KLAR', name:'KLAR'}];
  ufStatus:string;
  
  id: any;
  constructor(private _diffService: DiffService, private _route: ActivatedRoute) { }

  getUFavvikelse(){

    // this._diffService.getUFavvikelse(this.id).
    // then(ufavvikelse => this.ufavvikelse = ufavvikelse);

    this._diffService.getUFavvikelseOb(this.id)
    .subscribe((data:Ufavik) => {this.ufavvikelse = data;

      this.ufStatus =data.status;

      
    },
                error => console.log(error));
   console.log(this.ufavvikelse,this.ufStatus ,'HGFDDFFG');



//      .subscribe(details => {
// this.product_rating = details.product_rating;
// this.getstars(this.product_rating);
// }, error => this.errorMessage = <any>error);
  }
  ngOnInit() {
    this.id = this._route.snapshot.params['id'];
    this.getUFavvikelse();
    // this.setDefStatus();
  }

    setDefStatus(){
    //   this._diffService.getUFavvikelse(this.id).
    // then(data =>{ this.ufStatus = data.status});
    //   // var nystatus = this.ufavvikelse;
    //   console.log(this.ufStatus,'UFSTATUS');
    //   console.log(this.ufavvikelse);
    }
  uppdaterAvvikelse(kategori, ansvarig, status, noteringText){

    this.svarsmeddelande = 'Processerar......';
    this.ufavvikelse.status = status;
    this.ufavvikelse.kategori = kategori;
    this.ufavvikelse.ansvarig = ansvarig;
    this.ufavvikelse.notering.text = noteringText;

    this._diffService.uppdateraUF(this.ufavvikelse)
    .then(ufavvikelse => this.ufavvikelse = ufavvikelse)
    .catch(this.errorHandler);

    console.log(status);

    this.svarsmeddelande = 'Klart';

  }
  uppdaterAvvikelseMedNotering(kategori, ansvarig, status, noteringText){

    this.notering = {
            noteringid: null,
            period: '22',
            fmId: '22',
            personnummer: '22',
            felLista: 'UF',
            felTyp: '22',
            text: ''
      }

      this.notering.text = noteringText;
      this.notering.fmId = this.ufavvikelse.fmId;
      this.notering.personnummer = this.ufavvikelse.personnummer;
      this.ufavvikelse.notering = this.notering;
      this.ufavvikelse.status = status;
      this.ufavvikelse.kategori = kategori;
      this.ufavvikelse.ansvarig = ansvarig;

      console.log(this.ufavvikelse,'UFavvik');
      console.log(this.notering,'Notering');
      this._diffService.uppdateraUF(this.ufavvikelse)
        .then(ufavvikelse => this.ufavvikelse = ufavvikelse)
    .catch(this.errorHandler);
    console.log(status,'TEST');

    this.svarsmeddelande = 'Skapad';


  }

  errorHandler(error: any): any{

        console.log(error);
    }
}
