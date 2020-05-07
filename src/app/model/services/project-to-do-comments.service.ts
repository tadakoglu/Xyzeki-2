import { Injectable, } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { MemberShared } from '../member-shared.model';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { ProjectTaskComment } from '../project-task-comment.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class ProjectToDoCommentsService {
  baseURL: string;
  constructor(private http: HttpClient, private memberShared: MemberShared) {
    this.baseURL = BackEndWebServer + '/'
  }
  projectTaskComments(taskId: number): Observable<ProjectTaskComment[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<ProjectTaskComment[]>(this.baseURL + `api/ProjectToDoComments/ProjectToDo/${taskId}`, this.getOptions(token)) }));
  }
  findProjectTaskComment(messageId: number): Observable<ProjectTaskComment> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<ProjectTaskComment>(this.baseURL + `api/ProjectToDoComments/${messageId}`, this.getOptions(token)) }));
  }
  saveProjectTaskComment(projectTaskComment: ProjectTaskComment): Observable<number> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.post<number>(this.baseURL + "api/ProjectToDoComments", projectTaskComment, this.getOptions(token)) }));
  }
  updateProjectTaskComment(projectTaskComment: ProjectTaskComment): Observable<null> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null);
     else return this.http.put<null>(`${this.baseURL}api/ProjectToDoComments/${projectTaskComment.MessageId}`, projectTaskComment, this.getOptions(token)) }));
  }
  deleteProjectTaskComment(messageId: number): Observable<ProjectTaskComment> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.delete<ProjectTaskComment>(`${this.baseURL}api/ProjectToDoComments/${messageId}`, this.getOptions(token)) }));
  }
  getOptions(token) {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  }

}
