import { Injectable, ɵConsole } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { MemberShared } from '../member-shared.model';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { PrivateTalkMessage } from '../private-talk-message.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class PrivateTalkMessagesService {
    baseURL: string;
    auth_token: string;

    constructor(private http: HttpClient, private memberShared: MemberShared) {
        this.baseURL = BackEndWebServer + '/'
    }
    privateTalkMessages(privateTalkId: number,pageNo=1, pageSize?:number): Observable<PrivateTalkMessage[]> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalkMessage[]>(this.baseURL + `api/PrivateTalkMessages/PrivateTalk/${privateTalkId}/Page/${pageNo}/PageSize/${pageSize}`, this.getOptions(token))
        })); ///api/PrivateTalkMessages/PrivateTalk/2
    }
    findPrivateTalkMessage(privateTalkMessageId: number): Observable<PrivateTalkMessage> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalkMessage>(this.baseURL + `api/PrivateTalkMessages/${privateTalkMessageId}`, this.getOptions(token))
        }));    //api/PrivateTalkMessages/1
    }
    savePrivateTalkMessage(privateTalkMessage: PrivateTalkMessage): Observable<number> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.post<number>(this.baseURL + "api/PrivateTalkMessages", privateTalkMessage, this.getOptions(token))
        }));
    }
    deletePrivateTalkMessage(privateTalkMessageId: number): Observable<PrivateTalkMessage> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.delete<PrivateTalkMessage>(`${this.baseURL}api/PrivateTalkMessages/${privateTalkMessageId}`, this.getOptions(token))
        }));
    }
    getOptions(token) {
        return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
    }
    getOptions2() {
        return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
    }
}
