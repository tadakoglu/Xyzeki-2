import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { IAuthRepository } from 'src/app/model/abstract/i-auth-repository';
import { RegisterModel } from 'src/app/model/register.model';
import { ErrorCodes } from 'src/infrastructure/error-codes.enum';
import { MemberShared } from 'src/app/model/member-shared.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthRepository } from 'src/app/model/repository/auth-repository';

import { isNullOrUndefined } from 'util';
import { Router, ActivatedRoute } from '@angular/router';
import { MemberRepository } from 'src/app/model/repository/member-repository';
import { MembersService } from 'src/app/model/services/members.service';
import { Member } from 'src/app/model/member.model';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { GoogleReCaptcha_LoginAction } from 'src/infrastructure/google-captcha';
import { concatMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [{ provide: RegisterModel, useClass: RegisterModel }]
  , changeDetection: ChangeDetectionStrategy.Default
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  ngOnDestroy(): void {
    this.subscription ? this.subscription.unsubscribe() : () => { }
    this.subscription2 ? this.subscription2.unsubscribe() : () => { }
    this.subscription3 ? this.subscription3.unsubscribe() : () => { }
    this.subscription4 ? this.subscription4.unsubscribe() : () => { }
    this.subscription5 ? this.subscription5.unsubscribe() : () => { }
  }

  ngAfterViewInit(): void {
    if (!this.isUpdateMode) {
      this.loadDefaultAvatar();
      this.focusOnInputName();
    }

    else {
      this.focusOnInput();
    }
  }
  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocus'))
        document.getElementById('textForFocus').focus();
    }, 10);
  }
  focusOnInputName() {
    setTimeout(() => {
      if (document.getElementById('textForFocusName'))
        document.getElementById('textForFocusName').focus();
    }, 10);
  }
  private subscription: Subscription;
  private subscription2: Subscription;
  private subscription3: Subscription;
  private subscription4: Subscription;
  private subscription5: Subscription;
  constructor(private route: ActivatedRoute, private router: Router, private repository: AuthRepository,
    public registerModel: RegisterModel, private memberShared: MemberShared, private membersService: MembersService, private recaptchaV3Service: ReCaptchaV3Service) {
    this.route.data.subscribe(data => {
      if (data.kind === 'update') {
        this.isUpdateMode = true;
        this.loadAccount();
      }

    })
  }

  isUpdateMode = false;
  loadDefaultAvatar() {
    // let frontend = `${PROTOCOLF}://${HOST_NAMEF}:${PORTF}/`;
    let request = new XMLHttpRequest();
    request.open('GET', '../../../assets/avatar-default.png', true);
    request.responseType = 'blob';
    request.onload = () => {
      let reader = new FileReader();
      reader.readAsDataURL(request.response);
      reader.onloadend = (e) => {
        this.avatar = reader.result.toString();
        this.registerModel.Avatar = this.avatar; // load to model;
        this.showReset = false;
        this.avatarStatus = 'default'
        if (!isNullOrUndefined(this.lastEvent) && !isNullOrUndefined(this.lastEvent.target))
          this.lastEvent.target.value = ''; //also cancel file selection
      };

    };
    request.send();
  }
  loadAvatarBack() {
    this.subscription = this.memberShared.account.subscribe(myAccount => {
      this.registerModel.Avatar = myAccount.Avatar;
      this.avatar = myAccount.Avatar;
      this.avatarStatus = 'back';
    })
  }

  public avatarStatus = 'back';
  public showReset: boolean = false;
  public avatar: string = null; // base64
  lastEvent;
  onSelectAvatar($event) {
    if ($event.target.files.length > 0) {
      this.lastEvent = $event;
      let avatarImageFile: File = $event.target.files[0];
      let reader: FileReader = new FileReader();
      reader.readAsDataURL(avatarImageFile);
      reader.onloadend = (e) => {
        this.avatar = reader.result.toString();
        this.registerModel.Avatar = this.avatar; // load to model
        this.showReset = true;
        this.avatarStatus = 'default'
      }


    }

  }

  modelSent: boolean = false;
  modelSubmitted: boolean = false;
  informUser: string;
  isLoading = false;
  register(registerForm: NgForm) {
    if (this.isUpdateMode)
      this.update(registerForm);
    else {
      this.modelSubmitted = true;
      if (this.passwordRepeat != this.registerModel.Password)
        return;
      if (registerForm.valid) {
        this.isLoading = true;
        this.subscription2 = this.recaptchaV3Service.execute(GoogleReCaptcha_LoginAction).pipe(concatMap(
          recaptchaToken => { return this.repository.register(Object.assign({}, this.registerModel), recaptchaToken) })).subscribe(r => {
            if (r.ErrorCode == ErrorCodes.OK) {
              this.isLoading = true;
              this.informUser = "Tebrikler, üyeliğinizi tamamladık. Lütfen bekleyiniz..."
              setTimeout(() => {
                this.router.navigate(['/giris']);
              }, 2000);
            }
            else if (r.ErrorCode == ErrorCodes.MemberAlreadyExistsError) {
              this.informUser = "Üzgünüz, bu kullanıcı adı veya email'i kullanan başka bir üye bulunmaktadır."

            }
            this.modelSent = true;
            this.modelSubmitted = false;
            this.isLoading = false;

          }, (error: HttpErrorResponse) => {
            switch (error.status) {
              case 503: ; case 0:
                this.informUser = "Servis şu anda ulaşılabilir değildir. "
                break; // 0 status code = ERR_CONNECTION_REFUSED

            }
            this.modelSent = true;
            this.modelSubmitted = false;
            this.isLoading = false;
          })
      }
    }
  }

  update(registerForm: NgForm) {
    this.modelSubmitted = true;
    if (this.passwordRepeatUpdate != this.registerModel.Password)
      return;

    if (registerForm.valid) {
      this.subscription3 = this.membersService.updateMember(Object.assign({}, this.registerModel)).subscribe(r => {
        if (r.ErrorCode == ErrorCodes.OK) {
          this.informUser = "Tebrikler, profil bilgileriniz güncellendi."
          setTimeout(() => {
            this.informUser = "";
          }, 1500);

          let member: Member = new Member(null, null, null, null, null, null, null, 0, 0);
          Object.assign(member, this.registerModel);
          this.memberShared.account.next(member)
        }
        else if (r.ErrorCode == ErrorCodes.MemberAlreadyExistsError) {
          setTimeout(() => {
            this.informUser = "";
          }, 1500);
          this.informUser = "Üzgünüz, bu e-postayı kullanan başka bir üye bulunmaktadır."
        }
        this.modelSent = true;
        this.modelSubmitted = false;
      }, (error: HttpErrorResponse) => {
        switch (error.status) {
          case 503: ; case 0:
            setTimeout(() => {
              this.informUser = "";
            }, 1500);
            this.informUser = "Servis şu anda ulaşılabilir değildir. "
            break; // 0 status code = ERR_CONNECTION_REFUSED

        }
        this.modelSent = true;
        this.modelSubmitted = false;
      })
    }

  }

  public passwordRepeat: string = null; // register' form's pass repeat

  public passwordRepeatUpdate: string = null; // update' form's pass repeat

  enteredPassword: string = null;
  access = false;

  @ViewChild("grantAccessPass") grantAccessPass: ElementRef;
  grantAccess() {
    if (isNullOrUndefined(this.enteredPassword))
      return;

    this.subscription4 = this.membersService.grantAccess(this.enteredPassword).subscribe(answer => {
      if (answer) {
        this.access = true;
        this.registerModel.Password = this.enteredPassword
        this.passwordRepeatUpdate = this.enteredPassword;
      }
      else {
        this.accessInfo = "Üzgünüz, şifrenizi yanlış girdiniz. Hatırlamıyorsanız bize email gönderebilir veya bizi arayabilirsiniz."
        setTimeout(() => {
          this.accessInfo = null;
        }, 3000);
      }
    })

  }
  accessInfo = null;
  loadAccount() {
    this.subscription5 = this.memberShared.account.subscribe(myAccount => {
      this.registerModel.Username = myAccount.Username;
      this.registerModel.Name = myAccount.Name;
      this.registerModel.Surname = myAccount.Surname;
      this.registerModel.Email = myAccount.Email;
      this.registerModel.CellCountry = myAccount.CellCountry;
      this.registerModel.Cell = myAccount.Cell
      this.registerModel.Avatar = myAccount.Avatar;
      this.avatar = myAccount.Avatar;
    })
  }

}
