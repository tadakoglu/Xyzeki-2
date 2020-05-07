import { Injectable } from '@angular/core';
import { MemberShared } from '../member-shared.model';

import { Observable, of } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { MemberSetting } from '../member-setting.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class MemberSettingService {

  baseURL: string;
  auth_token: string;
  constructor(private http: HttpClient, private memberShared: MemberShared) {
    this.baseURL = BackEndWebServer + '/'
  }
  mySetting(): Observable<MemberSetting> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.get<MemberSetting>(this.baseURL + `api/MemberSetting/MySetting`, this.getOptions(token))
    }))
  }
  updateMySetting(mSetting: MemberSetting): Observable<null> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.put<null>(this.baseURL + "api/MemberSetting/" + mSetting.Username, mSetting, this.getOptions(token))
    }))
  }
  getOptions(token) {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  }


}
