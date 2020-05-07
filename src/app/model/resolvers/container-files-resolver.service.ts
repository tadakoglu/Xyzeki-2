import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { catchError, take } from 'rxjs/operators';
import { empty, Observable } from 'rxjs';
import { FilesService } from '../services/files.service';

@Injectable()
export class ContainerFilesResolverService implements Resolve<any> {
  constructor(private service: FilesService) { }
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    let containerName = route.paramMap.get('ContainerName')
    return this.service.showBlobs(containerName).pipe(catchError((error) => {
      return empty();
    }), take(1))
  }
}
