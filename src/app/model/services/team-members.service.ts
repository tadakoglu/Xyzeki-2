import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TeamMember } from '../team-member.model.';
import { Observable, of } from 'rxjs';
import { Member } from '../member.model';
import { MemberShared } from '../member-shared.model';
import { distinctUntilChanged, take, switchMap } from 'rxjs/operators';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
@Injectable()
export class TeamMembersService {
  baseURL: string;
  auth_token: string;

  constructor(private http: HttpClient, private memberShared: MemberShared) {
    this.baseURL = BackEndWebServer + '/'
    //this.auth_token = memberShared.Token;
  }
  teamMembers(teamId: number): Observable<TeamMember[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<TeamMember[]>(this.baseURL + `api/TeamMembers/Team/${teamId}`, this.getOptions(token)) }));
  }
  teamMembersJoined(): Observable<TeamMember[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<TeamMember[]>(this.baseURL + `api/TeamMembers/Joined`, this.getOptions(token)) }));
  }
  teamMembersOwned(): Observable<TeamMember[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<TeamMember[]>(this.baseURL + `api/TeamMembers/Owned`, this.getOptions(token)) }));
  }
  teamMembersJoinedAsMembers(): Observable<Member[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<Member[]>(this.baseURL + `api/TeamMembers/Joined/AsMembers`, this.getOptions(token)) }));
  }
  teamMembersOwnedAsMembers(): Observable<Member[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<Member[]>(this.baseURL + `api/TeamMembers/Owned/AsMembers`, this.getOptions(token)) }));
  }

  allTeamMembersPT(): Observable<TeamMember[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<TeamMember[]>(this.baseURL + `api/TeamMembers/AllTeamMembersPT`, this.getOptions(token)) }));
  }
  allTeamMembersPTAsMembers(): Observable<Member[]> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<Member[]>(this.baseURL + `api/TeamMembers/AllTeamMembersPTAsMembers`, this.getOptions(token)) }));
  }

  saveTeamMember(teamMember: TeamMember): Observable<number> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.post<number>(this.baseURL + "api/TeamMembers", teamMember, this.getOptions(token)) }));
  }
  updateTeamMember(teamMember: TeamMember): Observable<null> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.put<null>(`${this.baseURL}api/TeamMembers/${teamMember.TeamMemberId}`, teamMember, this.getOptions(token)) }));
  }
  deleteTeamMember(teamMemberId: number): Observable<TeamMember> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.delete<TeamMember>(`${this.baseURL}api/TeamMembers/${teamMemberId}`, this.getOptions(token)) }));
  }

  getOptions(token) {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  }
  getOptions2(teamMember: TeamMember) { // Special for delete methods.
    return {
      headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }),
      params: { "teamId": teamMember.TeamId.toString(), "username": teamMember.Username }
    };
  }
  getOptions3() {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
  }
}
