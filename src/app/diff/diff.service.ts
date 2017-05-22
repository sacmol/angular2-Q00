import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';

import { Avik } from '../avik';

import { Ufavik } from '../ufavik';


@Injectable()
export class DiffService{


    host = window.location.host;
    private _apiUrl: string = 'http://localhost:9080/webapp/q00ds03i/rs/spring/api/test';

    // private _apiUrl2: string = 'http://'+this.host+'/webapp/q00ds03i/rs/spring/api/searchdiff';
    // private _apiUrlUF: string = 'http://'+this.host+'/webapp/q00ds03i/rs/spring/api/searchuf';

    private _apiUrl2: string = 'http://localhost:9080/webapp/q00ds03i/rs/spring/api/searchdiff';
    private _apiUrlUF: string = 'http://localhost:9080/webapp/q00ds03i/rs/spring/api/searchuf';


    constructor(private _http: Http){   
    }

    errorHandler(error: any): any{

        console.log(error);
    }
      getDiffDtoTest(): Observable<Avik[]>{

        console.log('SAAASSSSAA') ; 
        return this._http.get('http://localhost:9080/webapp/q00ds03i/rs/spring/api/diffdto')
        .map((response: Response) => <Avik[]>response.json())
        .catch(this.errorHandler);
            

    }
    getCurrentTime(){

        return this._http.get('http://date.jsontest.com')
        .map(res => res.json())
        .catch(this.errorHandler);

    }
     private extractData(res: Response) {
         let body = res.json();console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG');  
         return body.data || { };
  }
    getTest(){
        return this._http.get(this._apiUrl)
        .map(res  => res.json())
        .catch(this.errorHandler);
    }

    // getDiffDtoTest(): Observable<DiffDto>{

    //     console.log('SAAASSSSAA') ; 
    //     return this._http.get('http://localhost:9080/webapp/q00ds03i/rs/spring/api/diffdto')
    //     .map(res => res.json())
    //     .catch(this.errorHandler);
            

    // }
    getSearchResultUF(perioden,pnr, fmid,selectedBol): Observable<Ufavik[]>{

        return this._http.get(this._apiUrlUF+'?perioden='+perioden+'&pnr='+pnr+'&fmid='+fmid+'&bolag='+ selectedBol.id)
            .map((response: Response) => <Ufavik[]>response.json())
            .catch(this.errorHandler);
        // .map(res  => res.json())
        // .catch(this.errorHandler);
    }

    getSearchResultDIFF(perioden,pnr, fmid,selectedBol): Observable<Avik[]>{

        return this._http.get(this._apiUrl2+'?perioden='+perioden+'&pnr='+pnr+'&fmid='+fmid+'&bolag='+ selectedBol.id)
            .map((response: Response) => <Avik[]>response.json())
        .catch(this.errorHandler);
        // .map(res  => res.json())
        // .catch(this.errorHandler);
    }
        getDiffAvvikelse(id: string){
        //     return this._http.get(this._apiUrl2+'/'+id)
        //     .map((response: Response) => <Avik>response.json())
        // .catch(this.errorHandler);

    let url = `${this._apiUrl2}/${id}`;
    return this._http.get(url).toPromise()
    .then(response => response.json() as Avik)
    .catch(this.errorHandler); 
        }

        getUFavvikelse(id: string){
            let url = `${this._apiUrlUF}/${id}`;
            return this._http.get(url).toPromise()
            .then(response => response.json() as Ufavik)
            .catch(this.errorHandler);
        }

         getUFavvikelseOb(id: string): Observable<Ufavik>{
            let url = `${this._apiUrlUF}/${id}`;
            return this._http.get(url).
            map((response: Response) => <Avik>response.json())
            .catch(this.errorHandler);
        }

private headers = new Headers({'Content-Type': 'application/json','Access-Control-Allow-Origin':'*'});



        uppdateraDiff(diffavvikelse: Avik): Promise<Avik>{

            console.log('i uppdatera service');
            let headers = new Headers({'content-type': 'application/json', 'accept': 'application/json','Access-Control-Allow-Origin':'*'});
            this.headers.append('Content-Type', 'application/json');
            this.headers.append('Access-Control-Allow-Origin', '*');
            let options = new RequestOptions({ headers: headers });
            let bodystring = JSON.stringify(diffavvikelse);
            console.log(bodystring)
            console.log(headers);

         return this._http
    .put(this._apiUrl2+'/update', bodystring, options)
    .toPromise()
    .then( response => response.json() as Avik)
    .catch(this.errorHandler);


        }

        uppdateraUF(ufavvikelse: Ufavik): Promise<Ufavik> {

            console.log('LLLLLLLLLLLLLLLLL', ufavvikelse);
             let headers = new Headers({'content-type': 'application/json', 'accept': 'application/json','Access-Control-Allow-Origin':'*'});
            this.headers.append('Content-Type', 'application/json');
            this.headers.append('Access-Control-Allow-Origin', '*');
            let options = new RequestOptions({ headers: headers });

            let bodystring = JSON.stringify(ufavvikelse);

            return this._http
                .put(this._apiUrlUF+'/update',bodystring, options)
                .toPromise()
                .then(response => response.json() as Ufavik)
                .catch(this.errorHandler);


        }
}









