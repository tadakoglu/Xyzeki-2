import { Injectable, ɵConsole } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProjectTask } from '../project-task.model';
import { Observable, timer, of } from 'rxjs';
import { MemberShared } from '../member-shared.model';
import { map, retryWhen, delayWhen, switchMap } from 'rxjs/operators';
import { CommentCountModel } from '../comment-count.model';
import { TaskOrderModel } from '../task-order.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class ProjectToDosService {
  baseURL: string;
  auth_token: string;

  constructor(private http: HttpClient, private memberShared: MemberShared) {
    this.baseURL = BackEndWebServer + '/'
    //this.auth_token = memberShared.Token;
  }
  saveAllTOMs(TOMs: TaskOrderModel[], projectId: number): Observable<boolean> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.post<boolean>(this.baseURL + "api/ProjectToDos/TOMs", TOMs, { params: { 'projectId': projectId.toString() }, headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) })
    }))
  }
  projectToDos(projectId: number): Observable<ProjectTask[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.get<ProjectTask[]>(this.baseURL + `api/ProjectToDos/Project/${projectId}`, this.getOptions(token)) }));
  }
  projectToDosAssignedToMe(searchValue?: string): Observable<ProjectTask[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.get<ProjectTask[]>(this.baseURL + `api/ProjectToDos/AssignedToMe/Search/${searchValue}`, this.getOptions(token)) }))
  }
  assignedToMePTCommentsCount(searchValue?: string): Observable<CommentCountModel[]> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.get<CommentCountModel[]>(this.baseURL + `api/ProjectToDos/AssignedToMe/CommentsCount/Search/${searchValue}`, this.getOptions(token))
    }))
  }
  projectToDosCommentsCount(projectId: number): Observable<CommentCountModel[]> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.get<CommentCountModel[]>(this.baseURL + `api/ProjectToDos/Project/${projectId}/CommentsCount`, this.getOptions(token))
    }));
  }
  complete(projectTodoId: number): Observable<ProjectTask> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.put<ProjectTask>(`${this.baseURL}api/ProjectToDos/Complete/${projectTodoId}`, null, this.getOptions(token)) }));
  }
  projectToDo(projectToDoId: number): Observable<ProjectTask> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.get<ProjectTask>(this.baseURL + `api/ProjectToDos/${projectToDoId}`, this.getOptions(token)) }));
  }
  saveProjectToDo(projectTask: ProjectTask): Observable<number> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.post<number>(this.baseURL + "api/ProjectToDos", projectTask, this.getOptions(token)) }));
  }
  updateProjectToDo(projectTask: ProjectTask): Observable<null> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.put<null>(`${this.baseURL}api/ProjectToDos/${projectTask.TaskId}`, projectTask, this.getOptions(token)) }));
  }
  deleteProjectToDo(taskId: number): Observable<ProjectTask> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.delete<ProjectTask>(`${this.baseURL}api/ProjectToDos/${taskId}`, this.getOptions(token)) }));
  }
  getOptions(token) {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  }
  getOptions2() {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
  }
}
