import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

/* this is for accessing API via localhost */
// except they may not accept the requests with cors header.
@Injectable()
export class CustomInterceptor implements HttpInterceptor {

    constructor() {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        request = request.clone({
            withCredentials: true
        });

        return next.handle(request);
    }
}