import { Component, OnInit, Input } from '@angular/core';

import { Router, ActivatedRoute} from '@angular/router';

import { DiffService } from '../diff/diff.service';

import { Ufavik } from '../ufavik';

@Component({
  selector: 'app-ufavvikelse',
  templateUrl: './ufavvikelse.component.html',
  styleUrls: ['./ufavvikelse.component.css']
})
export class UfavvikelseComponent implements OnInit {

  @Input() ufavvikelse: Ufavik;

  id: any;
  constructor(private _diffService: DiffService, private _route: ActivatedRoute) { }

  getUFavvikelse(){

    this._diffService.getUFavvikelse(this.id).
    then(ufavvikelse => this.ufavvikelse = ufavvikelse);

  }

  ngOnInit() {
    this.id = this._route.snapshot.params['id'];
    this.getUFavvikelse();
  }

}
