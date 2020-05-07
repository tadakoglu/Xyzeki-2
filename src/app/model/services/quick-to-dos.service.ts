import { Injectable, ɵConsole } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MemberShared } from '../member-shared.model';
import { QuickTask } from '../quick-task.model';
import { switchMap } from 'rxjs/operators';
import { CommentCountModel } from '../comment-count.model';
import { TaskOrderModel } from '../task-order.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class QuickToDosService {

  baseURL: string;
  auth_token: string;

  constructor(private http: HttpClient, private memberShared: MemberShared) {
    this.baseURL = BackEndWebServer + '/'
    //this.auth_token = memberShared.Token;
  }
  saveAllTOMs(TOMs: TaskOrderModel[]): Observable<boolean> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.post<boolean>(this.baseURL + "api/QuickToDos/TOMs", TOMs, { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) })
    }))
  }
  myQuickToDos(pageNo: number = 1, searchValue?: string, pageSize?: number): Observable<QuickTask[]> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.get<QuickTask[]>(this.baseURL + `api/QuickToDos/My/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`, this.getOptions(token))
    }));
  }
  assignedToMe(searchValue?: string): Observable<QuickTask[]> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.get<QuickTask[]>(this.baseURL + `api/QuickToDos/AssignedToMe/Search/${searchValue}`, this.getOptions(token))
    }));
  }
  myAndAssignedToMeQTCommentsCount(pageNo: number = 1, searchValue?: string, pageSize?: number): Observable<CommentCountModel[]> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.get<CommentCountModel[]>(this.baseURL + `api/QuickToDos/MyAndAssignedToMe/CommentsCount/Page/${pageNo}/Search/${searchValue}/PageSize/${pageSize}`, this.getOptions(token))
    }));
  }
  saveQuickTodo(quickToDo: QuickTask): Observable<number> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.post<number>(this.baseURL + "api/QuickToDos", quickToDo, this.getOptions(token)) }));
  }
  updateQuickTodo(quickToDo: QuickTask): Observable<null> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.put<null>(`${this.baseURL}api/QuickToDos/${quickToDo.TaskId}`, quickToDo, this.getOptions(token)) }));
  }
  deleteQuickTodo(quickToDoId: number): Observable<QuickTask> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.delete<QuickTask>(`${this.baseURL}api/QuickToDos/${quickToDoId}`, this.getOptions(token)) }));
  }
  findQuickToDo(taskId: number): Observable<QuickTask> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.get<QuickTask>(this.baseURL + `api/QuickToDos/${taskId}`, this.getOptions(token)) }));
  }
  complete(quickToDoId: number): Observable<QuickTask> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.put<QuickTask>(`${this.baseURL}api/QuickToDos/Complete/${quickToDoId}`, null, this.getOptions(token)) }));
  }
  deComplete(quickToDoId: number): Observable<QuickTask> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.put<QuickTask>(`${this.baseURL}api/QuickToDos/DeComplete/${quickToDoId}`, null, this.getOptions(token)) }));
  }
  getOptions(token) {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  }
  getOptions2() {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
  }

}
