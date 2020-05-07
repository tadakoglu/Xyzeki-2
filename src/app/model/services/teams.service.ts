import { Injectable } from '@angular/core';

import { Observable, timer, throwError, of } from 'rxjs';
import { Team } from '../team.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MemberShared } from '../member-shared.model';
import { map, toArray, distinctUntilChanged, take, takeWhile, takeLast, switchMap, retry, retryWhen, delayWhen, catchError, debounceTime, flatMap } from 'rxjs/operators';
import { timeout } from 'q';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class TeamsService {
  baseURL: string;
  auth_token;

  constructor(private http: HttpClient, private memberShared: MemberShared) {
    this.baseURL = BackEndWebServer + '/'
    //this.auth_token = memberShared.Token;
  }
  //For manuel model binding in Angular/TypeScript, also don't forget to use Object.assign(this, obj) or manuel your assignments in binding-model 
  // myTeams(): Observable<Team[]>{ 

  //   return this.http.get<any[]>(this.baseURL + "api/Teams/MyTeams", this.getOptions()).pipe(
  //    map( (dizi,index)=> {  let teams: Team[] = []; dizi.forEach(value=> teams.push(new Team(value))); return teams; })
  //   );
  // } 
  //token '0' means log out.
  myTeams(): Observable<Team[]> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.get<Team[]>(this.baseURL + "api/Teams/MyTeams", this.getOptions(token)) }))
  }

  isMyTeam(teamId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0')
        return of(null); else return this.http.get<boolean>(this.baseURL + `api/Teams/isMyTeam/${teamId}`, this.getOptions(token))
    }))
  }
  isTeamJoined(teamId: number): Observable<boolean> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0')
        return of(null); else return this.http.get<boolean>(this.baseURL + `api/Teams/isTeamJoined/${teamId}`, this.getOptions(token))
    }))
  }

  teamsJoined(): Observable<Team[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.get<Team[]>(this.baseURL + "api/Teams/Joined", this.getOptions(token)) }))
  }

  allTeamsPT(): Observable<Team[]> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.get<Team[]>(this.baseURL + "api/Teams/AllTeamsPT", this.getOptions(token))
    }))
  }
  findTeam(teamId: number): Observable<Team> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.get<Team>(this.baseURL + "api/Teams/" + teamId, this.getOptions(token)) }));
  }
  saveTeam(team: Team): Observable<number> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.post<number>(this.baseURL + "api/Teams", team, this.getOptions(token)) }));
  }
  updateTeam(team: Team): Observable<null> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.put<null>(`${this.baseURL}api/Teams/${team.TeamId}`, team, this.getOptions(token))
    }));
  }
  deleteTeam(teamId: number): Observable<Team> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.delete<Team>(`${this.baseURL}api/Teams/${teamId}`, this.getOptions(token)) }));
  }
  getOptions(token) {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  }
  getOptions2() {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
  }

}