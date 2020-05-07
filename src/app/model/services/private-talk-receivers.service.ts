import { Injectable, ɵConsole } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { MemberShared } from '../member-shared.model';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { PrivateTalkReceiver } from '../private-talk-receiver.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class PrivateTalkReceiversService {
    baseURL: string;
    auth_token: string;

    constructor(private http: HttpClient, private memberShared: MemberShared) {
        this.baseURL = BackEndWebServer + '/'
    }
    myPrivateTalkReceivers(pageNo: number = 1, searchValue?: string, pageSize?: number): Observable<PrivateTalkReceiver[]> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalkReceiver[]>(this.baseURL + `api/PrivateTalkReceivers/PrivateTalk/MyAll/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`, this.getOptions(token))
        })); //api/PrivateTalkReceivers/PrivateTalk/MyAll/Page/22
    }

    privateTalkReceivers(privateTalkId: number): Observable<PrivateTalkReceiver[]> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalkReceiver[]>(this.baseURL + `api/PrivateTalkReceivers/PrivateTalk/${privateTalkId}`, this.getOptions(token))
        })); ///api/PrivateTalkReceivers/PrivateTalk/2
    }
    findPrivateTalkReceiver(privateTalkReceiverId: number): Observable<PrivateTalkReceiver> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalkReceiver>(this.baseURL + `api/PrivateTalkReceivers/${privateTalkReceiverId}`, this.getOptions(token))
        }));    //api/PrivateTalkReceivers/1
    }
    savePrivateTalkReceiver(privateTalkReceiver: PrivateTalkReceiver): Observable<number> {
        return this.memberShared.token.pipe(switchMap(token => {
            return this.http.post<number>(this.baseURL + "api/PrivateTalkReceivers", privateTalkReceiver, this.getOptions(token));
        }))
    }
    savePrivateTalkReceivers(privateTalkReceivers: PrivateTalkReceiver[]): Observable<null> {
        return this.memberShared.token.pipe(switchMap(token => {
            return this.http.post<null>(this.baseURL + "api/PrivateTalkReceivers", privateTalkReceivers, this.getOptions(token));
        }))
    }


    deletePrivateTalkReceivers(privateTalkId: number): Observable<PrivateTalkReceiver[]> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.delete<PrivateTalkReceiver[]>(`${this.baseURL}api/PrivateTalkReceivers/PrivateTalk/${privateTalkId}`, this.getOptions(token))
        }));
    }
    getOptions(token) {
        return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
    }
    getOptions2() {
        return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
    }
}
