import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { Avik } from '../avik';

import { DiffService } from '../diff/diff.service';

@Component({
  selector: 'app-diffavvikelse',
  templateUrl: './diffavvikelse.component.html',
  styleUrls: ['./diffavvikelse.component.css']
})
export class DiffavvikelseComponent implements OnInit {

  @Input() diffavvikelse: Avik;

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

}
