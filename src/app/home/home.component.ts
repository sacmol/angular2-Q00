import { Component, OnInit, Injectable } from '@angular/core';

import { Observable} from 'rxjs/Rx';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    host = window.location.host;
    URL = 'http://'+this.host+'/webapp/q00ds03i/rs/spring/api/fileupload';
    title = 'Ladda upp filen';
    text: string;
    responsText: string;
    badRequest: string;

    filetoUpload: Array<File>;
    response: {};
  constructor() { }

  ngOnInit() {
  }

}
