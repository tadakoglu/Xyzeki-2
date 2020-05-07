import { Injectable, } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { MemberShared } from '../member-shared.model';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { QuickTaskComment } from '../quick-task-comment.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class QuickToDoCommentsService {
  baseURL: string;
  constructor(private http: HttpClient, private memberShared: MemberShared) {
    this.baseURL = BackEndWebServer + '/'
  }
  quickTaskComments(taskId: number): Observable<QuickTaskComment[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<QuickTaskComment[]>(this.baseURL + `api/QuickToDoComments/QuickToDo/${taskId}`, this.getOptions(token)) }));
  }
  findQuickTaskComment(messageId: number): Observable<QuickTaskComment> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<QuickTaskComment>(this.baseURL + `api/QuickToDoComments/${messageId}`, this.getOptions(token)) }));
  }
  saveQuickTaskComment(quickTaskComment: QuickTaskComment): Observable<number> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.post<number>(this.baseURL + "api/QuickToDoComments", quickTaskComment, this.getOptions(token)) }));
  }
  updateQuickTaskComment(quickTaskComment: QuickTaskComment): Observable<null> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null);
     else return this.http.put<null>(`${this.baseURL}api/QuickToDoComments/${quickTaskComment.MessageId}`, quickTaskComment, this.getOptions(token)) }));
  }
  deleteQuickTaskComment(messageId: number): Observable<QuickTaskComment> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.delete<QuickTaskComment>(`${this.baseURL}api/QuickToDoComments/${messageId}`, this.getOptions(token)) }));
  }
  getOptions(token) {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  }

}
