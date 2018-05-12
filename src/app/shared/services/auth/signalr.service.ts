import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { urlApi } from '../../url.api';

@Injectable()
export class SignalRService {
    private headers = new Headers({
        'Content-Type': 'application/json'
    });
    isDemoMode = false;

    private signalRToggleSource = new Subject<boolean>();
    signalRToggle$ = this.signalRToggleSource.asObservable();

    private eventViewedSource = new Subject<boolean>();
    eventViewed$ = this.eventViewedSource.asObservable();

    onSaleSent$: Observable<any>;
    onEventSent$: Observable<any>;
    onConfigSent$: Observable<any>;
    incasoSent$:Observable<any>;
    constructor(private http: Http) {}

    startDemo(userId: string): Observable<any> {
        return this.http.post(`${urlApi.serverdemo}StartSignalRDemoMode`, JSON.stringify({UserId: userId}), { headers: this.headers });
    }

    stopDemo(userId: string): Observable<any> {
        return this.http.post(`${urlApi.serverdemo}StopSignalRDemoMode`, JSON.stringify({UserId: userId}), { headers: this.headers });
    }

    getUserDemoId(): string {
        return 'Z' + Math.floor(Math.random() * 10000);
    }

    getGroupDemoId(): string {
        return 'T' + Math.floor(Math.random() * 10000);
    }

    setDemoMode() {
        this.isDemoMode = true;
    }

    disableDemoMode() {
        this.isDemoMode = false;
    }

    changeSignalRStatus(state: boolean) {
        this.signalRToggleSource.next(state);
    }

    eventWasViewed() {
        this.eventViewedSource.next();
    }
}
