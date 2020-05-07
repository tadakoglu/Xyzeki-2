import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { MemberShared } from '../member-shared.model';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CloudFiles } from '../azure-models/cloud-files.model';
import { CloudContainers } from '../azure-models/cloud-containers.model';
import { CloudFile } from '../azure-models/cloud-file.model';
import { CloudContainer } from '../azure-models/cloud-container.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';

@Injectable()
export class FilesService {
  baseURL: string;
  auth_token: string;

  constructor(private http: HttpClient, private memberShared: MemberShared) {
    this.baseURL = BackEndWebServer + '/'
  }
  showContainers(): Observable<CloudContainers> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.get<CloudContainers>(this.baseURL + 'api/Files/ListContainers', this.getOptions(token));
    }));
  }
  createContainer(containerName: string): Observable<CloudContainer> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.get<CloudContainer>(this.baseURL + `api/Files/CreateContainer/${containerName}`, this.getOptions(token));
    }));
  }
  deleteContainer(containerName: string): Observable<boolean> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.delete<boolean>(this.baseURL + `api/Files/DeleteContainer/${containerName}`, this.getOptions(token))
    }));
  }

  showBlobs(containerName): Observable<CloudFiles> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.get<CloudFiles>(this.baseURL + `api/Files/ListFiles/Container/${containerName}`, this.getOptions(token));
    }));
  }
  downloadFile(containerName: string, fileName: string): Observable<any> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.get(this.baseURL + `api/Files/DownloadFile/${fileName}/Container/${containerName}`,
          { responseType: "blob", headers: { "Authorization": `Bearer ${token}` } })
    }));
  }

  insertFile(containerName: string, fileToUpload: FormData): Observable<CloudFile> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.post<CloudFile>(this.baseURL + `api/Files/InsertFile/Container/${containerName}`, fileToUpload, this.getOptions(token));
    }));
  }
  deleteFile(containerName: string, fileName: string): Observable<boolean> {
    return this.memberShared.token.pipe(switchMap(token => {
      if (token == '0') return of(null); else
        return this.http.delete<boolean>(this.baseURL + `api/Files/DeleteFile/${fileName}/Container/${containerName}`, this.getOptions(token))
    }));
  }

  getOptions(token) {
    return { headers: new HttpHeaders({ "Authorization": `Bearer ${token}` }) }
  }

}
