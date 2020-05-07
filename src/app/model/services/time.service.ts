import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MemberShared } from '../member-shared.model';
import { switchMap, map } from 'rxjs/operators';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class TimeService {
  baseURL: string;

  constructor(private http: HttpClient, private memberShared: MemberShared) {
    this.baseURL = BackEndWebServer + '/'
  }

  getUnixTimestamp(): Observable<number> { //That's auto-binding, also works in Angular 6+(as far as I have tested)
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0')
        return of(null);
      else
        return this.http.get<number>(this.baseURL + `api/Auth/GetUnixTimestamp`)
    }))
  }
  getNow(): Observable<string> {
    return this.http.get(this.baseURL + `api/Auth/GetNow`, { responseType: 'text' })
  }
  getOptions3() {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json', }), responseType: 'text' };
  }



}
