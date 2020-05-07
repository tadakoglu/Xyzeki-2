import { Injectable } from '@angular/core';
import { CanActivate, Route, UrlSegment, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MemberShared } from '../member-shared.model';
import { Member } from '../member.model';

import { HttpHeaders, HttpClient } from '@angular/common/http';
import { switchMap, map } from 'rxjs/operators';
import { RegisterModel } from '../register.model';
import { ReturnModel } from '../return.model';
import { ErrorCodes } from 'src/infrastructure/error-codes.enum';
import { CryptoHelpersService } from './crypto-helpers.service';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class MembersService {

  baseURL: string;
  auth_token: string;

  constructor(private http: HttpClient, private memberShared: MemberShared, private cryptoHelpers: CryptoHelpersService) {
    this.baseURL = BackEndWebServer + '/'
    //this.auth_token = memberShared.Token;
  }
  getMember(username: string): Observable<Member> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); else return this.http.get<Member>(this.baseURL + "api/Members/GetUser/" + username, this.getOptions(token)) }));
  }
  updateMember(registerModel: RegisterModel): Observable<ReturnModel<object>> {
    registerModel.Password = this.cryptoHelpers.encryptWithAES(registerModel.Password); // Later will be decrypt in .NET 

    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.put(`${this.baseURL}api/Members/${registerModel.Username}`, registerModel, { observe: "response", headers: new HttpHeaders({ 'Content-Type': 'application/json', "Authorization": `Bearer ${token}`}), responseType: 'text' } ) })).
    pipe(map(response => {
      switch (response.status) {   // 200 OK, 200 OK but with error code, 503ServiceUnavailable.. 
        case 200:
          if (response.body == "#-1:ME")
            return new ReturnModel(ErrorCodes.MemberAlreadyExistsError, null);
        case 204: 
            return new ReturnModel(ErrorCodes.OK, null);
            
      }
    }))
  }
  grantAccess(passwordTry: string): Observable<boolean> {
    return this.memberShared.token.pipe(switchMap(token => { if (token == '0') return of(null); 
    else return this.http.get<boolean>(this.baseURL + "api/Members/GrantAccess/" + passwordTry, this.getOptions(token)) }));
  }

  getOptions(token) {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  }
  getOptions2() {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
  }

}
