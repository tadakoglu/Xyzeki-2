import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Project } from '../project.model';
import { Observable, of } from 'rxjs';
import { MemberShared } from '../member-shared.model';
import { switchMap } from 'rxjs/operators';
import { ProjectOrderModel } from '../project-order.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class ProjectsService {
  baseURL: string;
  auth_token: string;

  constructor(private http: HttpClient, private memberShared: MemberShared) {
    this.baseURL = BackEndWebServer + '/'
    //this.auth_token = memberShared.Token;
  }
  saveAllPOMs(POMs: ProjectOrderModel[]): Observable<boolean> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.post<boolean>(this.baseURL + "api/Projects/POMs", POMs, { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) })
    }))
  }
  // GET Projects/5343/isShareholder

  //Am I Shareholder ??
  isShareholder(projectId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0')
        return of(null); else return this.http.get<boolean>(this.baseURL + `api/Projects/isShareholder/${projectId}`, this.getOptions(token))
    }))
  }

  isMyProject(projectId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0')
        return of(null); else return this.http.get<boolean>(this.baseURL + `api/Projects/isMyProject/${projectId}`, this.getOptions(token))
    }))
  }
  isProjectAssigned(projectId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0')
        return of(null); else return this.http.get<boolean>(this.baseURL + `api/Projects/isProjectAssigned/${projectId}`, this.getOptions(token))
    }))
  }

  myProjects(): Observable<Project[]> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.get<Project[]>(this.baseURL + "api/Projects/MyProjects", this.getOptions(token))
    }))
  }
  myProjectsAssigned(): Observable<Project[]> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.get<Project[]>(this.baseURL + "api/Projects/MyProjects/Assigned", this.getOptions(token))
    }))
  }
  findProject(projectId: number): Observable<Project> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.get<Project>(this.baseURL + "api/Projects/" + projectId, this.getOptions(token)) }));
  }
  saveProject(project: Project): Observable<number> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.post<number>(this.baseURL + "api/Projects", project, this.getOptions(token))
    }));
  }
  updateProject(project: Project): Observable<null> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.put<null>(`${this.baseURL}api/Projects/${project.ProjectId}`, project, this.getOptions(token)) }));
  }
  deleteProject(projectId: number): Observable<Project> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.delete<Project>(`${this.baseURL}api/Projects/${projectId}`, this.getOptions(token)) }));
  }
  getOptions(token) {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  }
  getOptions2() {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
  }

}
