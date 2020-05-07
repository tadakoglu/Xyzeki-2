import { Injectable, ɵConsole } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { MemberShared } from '../member-shared.model';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { PrivateTalkTeamReceiver } from '../private-talk-team-receiver.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class PrivateTalkTeamReceiversService {
    baseURL: string;
    auth_token: string;

    constructor(private http: HttpClient, private memberShared: MemberShared) {
        this.baseURL = BackEndWebServer + '/'
    }
    myPrivateTalkTeamReceivers(pageNo: number = 1, searchValue?: string, pageSize?: number): Observable<PrivateTalkTeamReceiver[]> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalkTeamReceiver[]>(this.baseURL + `api/PrivateTalkTeamReceivers/PrivateTalk/MyAll/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`, this.getOptions(token))
        })); //api/PrivateTalkTeamReceivers/PrivateTalk/MyAll/Page/
    }

    privateTalkTeamReceivers(privateTalkId: number): Observable<PrivateTalkTeamReceiver[]> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalkTeamReceiver[]>(this.baseURL + `api/PrivateTalkTeamReceivers/PrivateTalk/${privateTalkId}`, this.getOptions(token))
        })); ///api/PrivateTalkTeamReceivers/PrivateTalk/2
    }
    findPrivateTalkTeamReceiver(privateTalkTeamReceiverId: number): Observable<PrivateTalkTeamReceiver> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalkTeamReceiver>(this.baseURL + `api/PrivateTalkTeamReceivers/${privateTalkTeamReceiverId}`, this.getOptions(token))
        }));    //api/PrivateTalkTeamReceivers/1
    }
    savePrivateTalkTeamReceiver(privateTalkTeamReceiver: PrivateTalkTeamReceiver): Observable<number> {
        return this.memberShared.token.pipe(switchMap(token => {
            return this.http.post<number>(this.baseURL + "api/PrivateTalkTeamReceivers", privateTalkTeamReceiver, this.getOptions(token));
        }))
    }
    savePrivateTalkTeamReceivers(privateTalkTeamReceivers: PrivateTalkTeamReceiver[]): Observable<null> {
        return this.memberShared.token.pipe(switchMap(token => {
            return this.http.post<null>(this.baseURL + "api/PrivateTalkTeamReceivers", privateTalkTeamReceivers, this.getOptions(token));
        }))
    }


    deletePrivateTalkTeamReceivers(privateTalkId: number): Observable<PrivateTalkTeamReceiver[]> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.delete<PrivateTalkTeamReceiver[]>(`${this.baseURL}api/PrivateTalkTeamReceivers/PrivateTalk/${privateTalkId}`, this.getOptions(token))
        }));
    }
    getOptions(token) {
        return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
    }
    getOptions2() {
        return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
    }
}
