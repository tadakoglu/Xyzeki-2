import { Component, OnInit, NgZone, OnDestroy, AfterViewInit, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { NgModel } from '@angular/forms';
import { LoginModel } from 'src/app/model/login.model';
import { IAuthRepository } from 'src/app/model/abstract/i-auth-repository';
import { MemberShared } from 'src/app/model/member-shared.model';
import { Router } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { TeamRepository } from 'src/app/model/repository/team-repository';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthRepository } from 'src/app/model/repository/auth-repository';
import { Member } from 'src/app/model/member.model';
import { ReturnModel } from 'src/app/model/return.model';
import { Tuple } from 'src/app/model/tuple.model';
import { MemberSettingService } from 'src/app/model/services/member-setting.service';
import { Subscription } from 'rxjs';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { GoogleReCaptcha_LoginAction } from 'src/infrastructure/google-captcha';
import { concatMap } from 'rxjs/operators';
import { DataService } from 'src/app/model/services/shared/data.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [{ provide: LoginModel, useClass: LoginModel }]
  , changeDetection: ChangeDetectionStrategy.Default
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  innerHeight: number;
  innerWidth: number;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  ngAfterViewInit(): void {
    this.focusOnInput();
  }
  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocus'))
        document.getElementById('textForFocus').focus();
    }, 10);
  }
  ngOnDestroy(): void {
    // this.subscription ? this.subscription.unsubscribe() : '';
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  constructor(private recaptchaV3Service: ReCaptchaV3Service, private router: Router, private repository: AuthRepository,
    public loginModel: LoginModel, public memberShared: MemberShared, private memberSettingService: MemberSettingService, private dataService: DataService) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }


  failNav() {
    this.modelSent = false;
  }
  isLoading = false;
  modelSent: boolean = false;
  modelSubmitted: boolean = false;
  authenticate(loginForm: NgModel) {

    this.modelSubmitted = true;
    if (loginForm.valid) {
      this.isLoading = true;
      this.subscription = this.recaptchaV3Service.execute(GoogleReCaptcha_LoginAction).pipe(concatMap(
        recaptchaToken => { return this.repository.authenticate(Object.assign({}, this.loginModel), recaptchaToken) })).subscribe((tokenAndMember: ReturnModel<Tuple<string, Member>>) => {
          this.memberShared.Auth(tokenAndMember);
          this.setUpMySetting();
          this.informUser = "Başarıyla giriş yaptınız."
          this.router.navigate(['/isler'])
          this.modelSent = true;
          this.modelSubmitted = false;
          this.isLoading = false;

        }, (error: HttpErrorResponse) => {
          switch (error.status) {
            case 401:
              this.informUser = "Girdiğiniz bilgiler yanlıştır, lütfen tekrar deneyiniz."
              break;
            case 503: ; case 0:
              this.informUser = "Servis şu anda ulaşılabilir değildir."
              break;

          }
          this.isLoading = false;
        }
        ).add(() => {
          this.modelSent = true;
          this.modelSubmitted = false;
          this.isLoading = false;
        })





    }
  }
  logOut() {
    this.memberShared.LogOut();
  }
  informUser: string;
  ngOnInit() { }



  subscription: Subscription;
  setUpMySetting() {
    this.memberSettingService.mySetting().subscribe(mSetting => {
      if (!mSetting)
        return;
      this.dataService.switchMode = mSetting.SwitchMode;
      let element: HTMLElement = document.getElementById('appBody');
      element.className = null;

      // if(this.innerWidth < 600){
      //   element.classList.add('KlasikMavi');
      //   return;
      // }



      switch (mSetting.Theme) {
        case 'KlasikMavi':
          element.classList.add('KlasikMavi');
          break;
        case 'KlasikKirmizi':
          element.classList.add('KlasikKirmizi');
          break;
        case 'KlasikSari':
          element.classList.add('KlasikSari');
          break;
        case 'KlasikMetalik':
          element.classList.add('KlasikMetalik');
          break;
        case 'KlasikGece':
          element.classList.add('KlasikGece');
          break;
        case 'KlasikRoyal':
          element.classList.add('KlasikRoyal');
          break;
        case 'KlasikLimeade':
          element.classList.add('KlasikLimeade');
          break;
        case 'KlasikBeyaz':
          element.classList.add('KlasikBeyaz');
          break;
        case 'ArashiyamaBambulari':
          element.classList.add('ArashiyamaBambulari');
          break;
        case 'Venedik':
          element.classList.add('Venedik');
          break;
        case 'Peribacalari':
          element.classList.add('Peribacalari');
          break;
        case 'Orman':
          element.classList.add('Orman');
          break;
        case 'Yaprak':
          element.classList.add('Yaprak');
          break;
        case 'Kedi':
          element.classList.add('Kedi');
          break;
        case 'Deniz':
          element.classList.add('Deniz');
          break;
        case 'Deve':
          element.classList.add('Deve');
          break;
        case 'Pamukkale':
          element.classList.add('Pamukkale');
          break;
        case 'Denizalti':
          element.classList.add('Denizalti');
          break;
        case 'Brienz':
          element.classList.add('Brienz');
          break;
        case 'Aconcagua':
          element.classList.add('Aconcagua');
          break;
        case 'Bulutlar':
          element.classList.add('Bulutlar');
          break;
        case 'TropicalGunisigi':
          element.classList.add('TropicalGunisigi');
          break;
        case 'DenizAgac':
          element.classList.add('DenizAgac');
          break;
        case 'Tarla':
          element.classList.add('Tarla');
          break;
        case 'EmpireState':
          element.classList.add('EmpireState');
          break;

      }
      element.classList.add('bg-helper');
    })

  }

}
