import { Component, Injectable } from '@angular/core';

import { Observable} from 'rxjs/Rx';

// const URL = 'http://localhost:9080/webapp/q00ds03i/rs/spring/api/fileupload';

@Component({
  selector: 'file-detail',
  templateUrl: './file.component.html',
  styleUrls: ['./app.component.css'],
})


export class FileComponent{

    host = window.location.host;
    URL = 'http://'+this.host+'/webapp/q00ds03i/rs/spring/api/fileupload';
    title = 'Ladda upp filen';
    text: string;
    responsText: string;
    badRequest: string;

    filetoUpload: Array<File>;
    response: {};

    constructor() {
    this.filetoUpload = [];
}

upload() {

    let host = window.location.host;
        this.makeFileRequest(this.URL, [], this.filetoUpload).then((result) => {           
            this.response = result;            
        }, (error) => {
            console.error(error);
        });
    }
fileChangeEvent(fileInput: any){
        this.filetoUpload = <Array<File>> fileInput.target.files;
    }

        makeFileRequest(url: string, params: Array<string>, files: Array<File>) {
        return new Promise((resolve, reject) => {
            let formData: any = new FormData();
            let xhr = new XMLHttpRequest();
           
            for(let i =0; i < files.length; i++) {
                formData.append("file", files[i], files[i].name);                
            }            

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var data: Array<string> = JSON.parse(xhr.responseText);
                        this.responsText = data[0];

                        if(this.responsText === '1'){
                            this.text = 'Inläsningen gick bra !';
                            // reject(xhr.response);
                        } else if(this.responsText === '2'){
                            this.text = 'ERROR: filen redan inläst';
                        }else if(this.responsText === '3'){
                            this.text = 'ERROR: valideringsfel';
                        }else if(this.responsText === '4'){
                            this.text = 'ERROR: tom fil';
                        }
                       
                        this.badRequest = '';
                        console.log('OPENEDDD', xhr.status,'treeqw',xhr.responseText);

                        resolve(JSON.parse(xhr.response));                        
                    }else{
                        this.badRequest = '';
                        this.text = 'ej uppladdat';
                        console.log('OPENEDs', xhr.status,'ewew',xhr.responseText);
                        reject(xhr.response);
                    }
                }else if(xhr.readyState === 0 ){
                    //  xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
                        this.text = 'nollan';
                }else if(xhr.readyState === 1 ){
                    
                        this.text = 'Processerar filen !!!';
                }else if(xhr.readyState === 2 ){
                    
                        this.text = 'tåan';
                }else if(xhr.readyState === 3 ){
                    
                        this.text = 'trean';
                }
            };
     
            xhr.open("POST", url, true);
            xhr.send(formData);
        });
    }

}