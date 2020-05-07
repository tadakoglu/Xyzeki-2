import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MemberShared } from '../member-shared.model';
import { switchMap } from 'rxjs/operators';
import { PrivateTalk } from '../private-talk.model';
import { MessageCountModel } from '../message-count.model';
import { PrivateTalkLastSeen } from '../private-talk-last-seen.model';
import { PrivateTalkReceiver } from '../private-talk-receiver.model';
import { PrivateTalkTeamReceiver } from '../private-talk-team-receiver.model';
import { PrivateTalkInsideOut } from '../private-talk-inside-out.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class PrivateTalksService {

    baseURL: string;
    auth_token: string;

    constructor(private http: HttpClient, private memberShared: MemberShared) {
        this.baseURL = BackEndWebServer + '/'
    }
    isMyPrivateTalk(privateTalkId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0')
                return of(null); else return this.http.get<boolean>(this.baseURL + `api/PrivateTalks/isMyPrivateTalk/${privateTalkId}`, this.getOptions(token))
        }))
    }
    isPrivateTalkJoined(privateTalkId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0')
                return of(null); else return this.http.get<boolean>(this.baseURL + `api/PrivateTalks/isPrivateTalkJoined/${privateTalkId}`, this.getOptions(token))
        }))
    }

    myPrivateTalks(pageNo = 1, searchValue?: string, pageSize?: number): Observable<PrivateTalk[]> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalk[]>(`${this.baseURL}api/PrivateTalks/MyPrivateTalks/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`, this.getOptions(token))
        }))  //api/PrivateTalks/MyPrivateTalks
    }
    privateTalksReceived(pageNo = 1, searchValue?: string, pageSize?: number): Observable<PrivateTalk[]> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalk[]>(`${this.baseURL}api/PrivateTalks/Received/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`, this.getOptions(token))
        })) //api/PrivateTalks/Received
    }

    myPrivateTalkMessagesCount(pageNo: number = 1, searchValue?: string, pageSize?: number): Observable<MessageCountModel[]> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<MessageCountModel[]>(this.baseURL + `api/PrivateTalks/My/MessagesCount/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`, this.getOptions(token))
        }));
    }

    receivedPrivateTalkMessagesCount(pageNo: number = 1, searchValue?: string, pageSize?: number): Observable<MessageCountModel[]> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<MessageCountModel[]>(this.baseURL + `api/PrivateTalks/Received/MessagesCount/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`, this.getOptions(token))
        }));
    }
    unreadMyPtCount(): Observable<number> {
        // GET PrivateTalks/MyPTUnreadCount  
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<number>(this.baseURL + `api/PrivateTalks/MyPTUnreadCount`, this.getOptions(token))
        }));
    }
    unreadReceivedPtCount(): Observable<number> {
        // GET   PrivateTalks/ReceivedPTUnreadCount  
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<number>(this.baseURL + `api/PrivateTalks/ReceivedPTUnreadCount`, this.getOptions(token))
        }));
    }
    //[Type(MyOrReceived), PrivateTalk, MessageCountModel, Receivers, TeamReceivers]       
    getNewUnreadPrivateTalk(privateTalkId: number): Observable<PrivateTalkInsideOut> {
        // GET     PrivateTalks/GetNewUnreadPrivateTalk/{privateTalkId}
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalkInsideOut>(this.baseURL + `api/PrivateTalks/GetNewUnreadPrivateTalk/${privateTalkId}`, this.getOptions(token))
        }));
    }



    saveOrUpdatePrivateTalkLastSeen(privateTalkLastSeen: PrivateTalkLastSeen): Observable<null> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.post<null>(this.baseURL + "api/PrivateTalks/PrivateTalkLastSeen", privateTalkLastSeen, this.getOptions(token))
        })) // 
    }
    findPrivateTalk(privateTalkId: number): Observable<PrivateTalk> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.get<PrivateTalk>(this.baseURL + "api/PrivateTalks/" + privateTalkId, this.getOptions(token))
        })) // api/PrivateTalks/1
    }
    savePrivateTalk(privateTalk: PrivateTalk): Observable<number> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.post<number>(this.baseURL + "api/PrivateTalks", privateTalk, this.getOptions(token))
        }))
    }
    updatePrivateTalk(privateTalk: PrivateTalk): Observable<null> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.put<null>(`${this.baseURL}api/PrivateTalks/${privateTalk.PrivateTalkId}`, privateTalk, this.getOptions(token))
        }))
    }
    deletePrivateTalk(privateTalkId: number): Observable<PrivateTalk> {
        return this.memberShared.token.pipe(switchMap(token => {
            if (token == '0') return of(null);
            else return this.http.delete<PrivateTalk>(`${this.baseURL}api/PrivateTalks/${privateTalkId}`, this.getOptions(token))
        }))
    }
    getOptions(token) {
        return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
    }
    getOptions2() {
        return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
    }
}
