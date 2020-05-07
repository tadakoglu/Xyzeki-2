import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LicenseManagementComponent } from './license-management/license-management.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MemberModule } from '../member/member.module';

@NgModule({
  declarations: [LicenseManagementComponent],
  imports: [
    CommonModule, FormsModule, NgbModule, MemberModule,
    RouterModule
  ],
  exports: [LicenseManagementComponent]
})
export class AdminModule { }
