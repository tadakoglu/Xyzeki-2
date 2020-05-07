import { Injectable } from '@angular/core';
import { LoginModel } from '../login.model';
import { ReturnModel } from '../return.model';
import { AuthService } from '../services/auth.service';
import { IAuthRepository } from '../abstract/i-auth-repository';
import { RegisterModel } from '../register.model';
import { Observable, from, of, observable, Subject, BehaviorSubject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorCodes } from 'src/infrastructure/error-codes.enum';
import { Member } from '../member.model';
import { Tuple } from '../tuple.model';
import { SecurityCodeModel } from '../security-code.model';

@Injectable()
export class AuthRepository implements IAuthRepository {
    //My-Notes
    //BehaviorSubject also includes latest emitted value, can be reach by getValue()
    constructor(private service: AuthService) { }

    authenticate(loginModel: LoginModel, recaptchaToken: string): Observable<ReturnModel<Tuple<string, Member>>> {
        return this.service.authenticate(loginModel, recaptchaToken);
    }

    register(registerModel: RegisterModel, recaptchaToken: string): Observable<ReturnModel<number>> {
        return this.service.register(registerModel, recaptchaToken);
    }
    
    isSecurityCodeFoundAndValid(securityCode: string): Observable<boolean> {
        return this.service.isSecurityCodeFoundAndValid(securityCode);
    }
    requestForgotPasswordEmail(email: string, recaptchaToken: string): Observable<ReturnModel<null>> {
        return this.service.requestForgotPasswordEmail(email, recaptchaToken);
    }
    setUpNewPassword(securityCodeModel: SecurityCodeModel, recaptchaToken: string): Observable<ReturnModel<null>> {
        return this.service.setUpNewPassword(securityCodeModel, recaptchaToken);
    }






}
