import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MemberLicensesComponent } from './member-licenses/member-licenses.component';
import { SettingsComponent } from './settings/settings.component';
import { AzureSaOccupancyComponent } from './azure-sa-occupancy/azure-sa-occupancy.component';
import { AboutComponent } from './about/about.component';
import { NavbarModule } from '../navbar/navbar.module';

@NgModule({
  declarations: [MemberLicensesComponent,SettingsComponent,AzureSaOccupancyComponent, AboutComponent],
  imports: [
    CommonModule, FormsModule,NgbModule,
    RouterModule,NavbarModule
  ],
  exports: [MemberLicensesComponent,SettingsComponent,AzureSaOccupancyComponent, AboutComponent]
  
})
export class MemberModule { }
