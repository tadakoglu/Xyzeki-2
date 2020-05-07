import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IForgotPasswordComponent } from './i-forgot-password/i-forgot-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { GoogleReCaptcha_SiteKey } from 'src/infrastructure/google-captcha';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, IForgotPasswordComponent, ChangePasswordComponent],
  imports: [
    CommonModule, FormsModule, NgbModule, RecaptchaV3Module,
    RouterModule
  ],
  providers: [
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: GoogleReCaptcha_SiteKey },
  ],
  exports: [LoginComponent, RegisterComponent]

})
export class AuthModule { }
