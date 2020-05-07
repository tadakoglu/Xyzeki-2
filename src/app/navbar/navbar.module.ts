import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavProfileComponent } from './nav-profile/nav-profile.component';
import { NavbarSecondaryComponent } from './navbar-secondary/navbar-secondary.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthGuardService } from '../model/services/guards/auth-guard.service';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [NavbarComponent, NavbarSecondaryComponent, NavProfileComponent],
  imports: [
    CommonModule, FormsModule, NgbModule, RouterModule
  ],
  exports:[NavbarComponent, NavbarSecondaryComponent, NavProfileComponent],
  providers:[AuthGuardService]
})
export class NavbarModule { }
