import { Injectable } from '@angular/core';
import { LoginModel } from '../login.model';
import { ReturnModel } from '../return.model';
import { Observable } from 'rxjs';
import { RegisterModel } from '../register.model';
import { SecurityCodeModel } from '../security-code.model';

// TypeScript doesn't allow to use interfaces as "provide" in service providers for that reason we'll use abtract classes.
// If we don't specify abstract on methods etc in an abstract class we could implement them in a 'abstract' class.
@Injectable()
export abstract class IAuthRepository { // Include only public members here.

    abstract authenticate(loginModel: LoginModel, recaptchaToken: string)
    abstract register(registerModel: RegisterModel, recaptchaToken: string)

    abstract isSecurityCodeFoundAndValid(securityCode: string): Observable<boolean>
    
    abstract requestForgotPasswordEmail(email: string, recaptchaToken: string): Observable<ReturnModel<null>>
    abstract setUpNewPassword(securityCodeModel: SecurityCodeModel, recaptchaToken: string): Observable<ReturnModel<null>>
}
