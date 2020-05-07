import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NgModel } from '@angular/forms';
import { AuthRepository } from 'src/app/model/repository/auth-repository';
import { SecurityCodeModel } from 'src/app/model/security-code.model';
import { ErrorCodes } from 'src/infrastructure/error-codes.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { GoogleReCaptcha_LoginAction } from 'src/infrastructure/google-captcha';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
  , changeDetection: ChangeDetectionStrategy.Default
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  constructor(private repository: AuthRepository, private route: ActivatedRoute, private recaptchaV3Service: ReCaptchaV3Service) {
    this.route.paramMap.subscribe(params => {
      this.securityCodeModel = new SecurityCodeModel(null, null);
      this.securityCodeModel.SecurityCode = params.get('SecurityCode').toString();
    })
  }
  ngOnDestroy(): void {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
  subscription: Subscription
  modelSent: boolean = false;
  modelSubmitted: boolean = false;
  informUser: string;
  isLoading = false;
  succeeded = false;

  public passwordRepeatUpdate: string;
  public securityCodeModel: SecurityCodeModel = new SecurityCodeModel(null, null);

  changePassword(secureCodeModelForm: NgModel) {
    this.modelSubmitted = true;
    if (this.securityCodeModel.NewPassword != this.passwordRepeatUpdate)
      return;
    if (secureCodeModelForm.valid) {
      this.isLoading = true;

      this.subscription = this.recaptchaV3Service.execute(GoogleReCaptcha_LoginAction).pipe(concatMap(
        recaptchaToken => { return this.repository.setUpNewPassword(Object.assign({},this.securityCodeModel), recaptchaToken) })).subscribe(r => {
          if (r.ErrorCode == ErrorCodes.OK) {
            this.informUser = "Tebrikler, şifreniz başarıyla değiştirildi. Artık giriş yapabilirsiniz."
            this.succeeded = true;
          }
          this.modelSent = true;
          this.modelSubmitted = false;
          this.isLoading = false;
        }, (error: HttpErrorResponse) => {
          switch (error.status) { // This is the TRUE option to get 404 answers.
            case 404:
              this.informUser = "Üzgünüz, işleminizi gerçekleştiremiyoruz. Bu bağlantının geçerliliği dolmuş gözüküyor."
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
