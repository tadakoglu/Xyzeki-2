import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NgModel } from '@angular/forms';
import { AuthRepository } from 'src/app/model/repository/auth-repository';
import { ReturnModel } from 'src/app/model/return.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorCodes } from 'src/infrastructure/error-codes.enum';
import { Subscription } from 'rxjs';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { GoogleReCaptcha_LoginAction } from 'src/infrastructure/google-captcha';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-i-forgot-password',
  templateUrl: './i-forgot-password.component.html',
  styleUrls: ['./i-forgot-password.component.css']
  , changeDetection: ChangeDetectionStrategy.Default
})
export class IForgotPasswordComponent implements OnInit, AfterViewInit, OnDestroy {
  ngOnDestroy(): void {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
  subscription: Subscription
  ngAfterViewInit(): void {
    this.focusOnInput();
  }

  constructor(private repository: AuthRepository, private recaptchaV3Service: ReCaptchaV3Service) { }

  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocus'))
        document.getElementById('textForFocus').focus();
    }, 10);
  }

  public emailAdress: string;

  modelSent: boolean = false;
  modelSubmitted: boolean = false;
  informUser: string;
  isLoading = false;
  succeeded = false;

  requestForgotPasswordEmail(emailForm: NgModel) {
    this.modelSubmitted = true;
    if (emailForm.valid) {
      this.isLoading = true;

     this.subscription= this.recaptchaV3Service.execute(GoogleReCaptcha_LoginAction).pipe(concatMap(
        recaptchaToken => { return this.repository.requestForgotPasswordEmail(this.emailAdress, recaptchaToken) })).subscribe(r => {
          if (r.ErrorCode == ErrorCodes.OK) {
            this.informUser = "E-posta adresinize 15 dakika boyunca geçerli bir şifre yenileme bağlantısı gönderdik. E-postanıza giderek gerekli işlemleri yapabilirsiniz."
            this.succeeded = true;
          }
          // else if (r.ErrorCode == ErrorCodes.ItemNotFoundError) {
          //   this.informUser = "Üzgünüz, girdiğiniz e-posta adresiyle ilgili bir hesap bulamadık."
          // }
          this.modelSent = true;
          this.modelSubmitted = false;
          this.isLoading = false;
        }, (error: HttpErrorResponse) => {
          switch (error.status) { // This is the TRUE option to get 404 answers.
            case 404:
              this.informUser = "Üzgünüz, girdiğiniz e-posta adresiyle ilgili bir hesap bulamadık."
              break;
            case 503: ; case 0:
              this.informUser = "Servis şu anda ulaşılabilir değildir. "
              break; // 0 status code = ERR_CONNECTION_REFUSED

          }
          this.isLoading = false;
          this.modelSent = true;
          this.modelSubmitted = false;
        })





    }
  }

  ngOnInit() {
  }

}
