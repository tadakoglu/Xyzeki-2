import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { MemberShared } from 'src/app/model/member-shared.model';
import { MembersService } from 'src/app/model/services/members.service';
import { Member } from 'src/app/model/member.model';
import { MemberSettingService } from 'src/app/model/services/member-setting.service';
import { MemberSetting } from 'src/app/model/member-setting.model';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { MemberLicenseService } from 'src/app/model/services/member-license.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class SettingsComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  constructor(private permissions: MemberLicenseRepository, public memberShared: MemberShared, private memberSettingService: MemberSettingService) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  ngOnInit() {
    this.loadSetting();
  }
  innerHeight: number;
  innerWidth: number;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  public selectedTheme;
  public subscription: Subscription
  selectTheme(selectedTheme: string) {
    if (this.permissions.getAccessGranted()) {
      let mSetting: MemberSetting = new MemberSetting(this.memberShared.Username, selectedTheme, this.ownerReporting, this.assignedToReporting);
      if (selectedTheme) {
        this.subscription = this.memberSettingService.updateMySetting(mSetting).subscribe(() => {
          this.selectedTheme = selectedTheme;

          let element: HTMLElement = document.getElementById('appBody');
          element.className = null;
          switch (selectedTheme) {
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
        });

      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }

  }
  invalidLicensePanelOpen = false;
  loadSetting() {
    this.memberSettingService.mySetting().subscribe(mSetting => {
      this.selectedTheme = mSetting.Theme;
      this.ownerReporting = mSetting.OwnerReporting;
      this.assignedToReporting = mSetting.AssignedToReporting;
    })

  }

  saveReportingSettings(kind: string = "owner", value = true) {
    if (this.permissions.getAccessGranted()) {
      if (kind == "owner") {
        this.ownerReporting = value;
      } else {
        this.assignedToReporting = value;
      }
      let mSetting: MemberSetting = new MemberSetting(this.memberShared.Username, this.selectedTheme, this.ownerReporting, this.assignedToReporting);

      this.subscription = this.memberSettingService.updateMySetting(mSetting).subscribe(() => {
        // this.ownerReporting = mSetting.OwnerReporting;
        // this.assignedToReporting = mSetting.AssignedToReporting;
      });
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }

  }
  ownerReporting = true;
  assignedToReporting = true;



}
