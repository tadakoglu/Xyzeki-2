import { Injectable } from '@angular/core';
import { MemberShared } from '../member-shared.model';

import { Observable, of } from 'rxjs';
import { MemberLicense } from '../member-license.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { MemberLicenseSM } from '../member-license-sm.model';
import { switchMap } from 'rxjs/operators';
import { MemberLicenseUsedStorage } from '../member-license-used-storage.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class MemberLicenseService {
  baseURL: string;
  auth_token: string;
  constructor(private http: HttpClient, private memberShared: MemberShared) {
    this.baseURL = BackEndWebServer + '/'
    //this.auth_token = memberShared.Token;
  }
  // kurumsal(ekip) lisansı, ml.LicenseType=="kurumsal"
  primaryAccessGranted(): Observable<boolean> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.get<boolean>(this.baseURL + `api/MemberLicense/PrimaryAccessGranted`, this.getOptions(token))
    }))
  }
  // herhangi bir çeşit lisans var mı.
  accessGranted(): Observable<boolean> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.get<boolean>(this.baseURL + `api/MemberLicense/AccessGranted`, this.getOptions(token))
    }))
  }

  allLicenses(): Observable<MemberLicense[]> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.get<MemberLicense[]>(this.baseURL + `api/MemberLicense/AllLicenses`, this.getOptions(token))
    }))
  }

  newLicense(memberLicense: MemberLicense): Observable<string> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.post<string>(this.baseURL + "api/MemberLicense", memberLicense, this.getOptions(token))
    }))
  }
  deleteLicense(licenseId: string): Observable<MemberLicense> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null);
      else return this.http.delete<MemberLicense>(`${this.baseURL}api/MemberLicense/${licenseId}`, this.getOptions(token))
    }));
  }

  myLicense(): Observable<MemberLicense> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.get<MemberLicense>(this.baseURL + `api/MemberLicense/MyLicense`, this.getOptions(token))
    }))
  }
  usedStorage(licenseId: string): Observable<MemberLicenseUsedStorage> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.get<MemberLicenseUsedStorage>(this.baseURL + `api/MemberLicense/${licenseId}/UsedStorage`, this.getOptions(token))
    }))
  }


  getOptions(token) {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  }
  getOptions2(memberLicenseSM: MemberLicenseSM) { // Special for delete method
    return {
      headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }),
      params: { "licenseId": memberLicenseSM.LicenseId }
    };
  }
  getOptions3() {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${this.auth_token}` }) }
  }
}



  // validateLicense(memberLicenseSM: MemberLicenseSM): Observable<MemberLicense> {
  //   return this.memberShared.token.pipe(switchMap(token => {
  //     if (token == '0') return of(null); else
  //       return this.http.put<MemberLicense>(this.baseURL + "api/MemberLicenses", memberLicenseSM, this.getOptions(token))
  //   }))
  // }