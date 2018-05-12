import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/publishLast';

import { StorageTerminalsData, Terminal } from '../../models';
import { urlApi } from '../../url.api';
import { AuthService } from '../../services/auth/auth.service';

@Injectable()
export class GetTerminalsService {
  changeTerminal= new BehaviorSubject<any>(null);
  changeTerminal$=this.changeTerminal.asObservable();
  terminals = new BehaviorSubject<Terminal[]>([]);
  terminals$ = this.terminals.asObservable();
  private baseUrl: string;
  private dataStore: StorageTerminalsData;
  private headers = new Headers({
    'Content-Type': 'application/json'
  });
  loggedIn: boolean;

  constructor(public http: Http, private auth: AuthService) {
    this.auth.isLoggedIn.subscribe(isLoggedIn => {
      this.baseUrl = isLoggedIn ? urlApi.server : urlApi.serverdemo;
    });
    // this.dataStore = new StorageTerminalsData();
    // this._terminals$ = <BehaviorSubject<StorageTerminalsData>>new BehaviorSubject(new StorageTerminalsData());
    // this.terminals = this._terminals$.asObservable();
  }

  // get terminals() {
  //   return this._terminals$.asObservable();
  // }

  getTerminals() {
    const Pk = sessionStorage.getItem('TnPk');
    const serviseUrl = this.baseUrl + 'GetTerminals';
    return this.http.post(serviseUrl, JSON.stringify({ Pk }), { headers: this.headers })
      .map(response => response.json());
  }

  getTerminals$() {
    const Pk = sessionStorage.getItem('TnPk');
    const serviseUrl = this.baseUrl + 'GetTerminals';
    return this.http.post(serviseUrl, JSON.stringify({ Pk }), { headers: this.headers })
      .subscribe(response => {
        const data = response.json();
        if (data.IsSuccess) {
          this.terminals.next(data.Terminals);
        }
      });
  }
  change(val){
    this.changeTerminal.next(val);
  }
}
