import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AuthGuardService } from '../model/services/guards/auth-guard.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QuickToDosComponent } from './quick-to-dos/quick-to-dos.component';
import { FormsModule } from '@angular/forms';
import { NavbarModule } from '../navbar/navbar.module';
import { MyToDosComponent } from './my-to-dos/my-to-dos.component';
import { UiToolsModule } from '../ui-tools/ui-tools.module';
import { PipesModule } from 'src/infrastructure/pipes/pipes.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommentModule } from '../comment/comment.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [HomeComponent, MyToDosComponent, QuickToDosComponent],
  imports: [
    CommonModule, FormsModule, NgbModule, NavbarModule,
    UiToolsModule, PipesModule, DragDropModule, CommentModule, InfiniteScrollModule, MatIconModule,
    RouterModule
  ],
  exports: [HomeComponent, MyToDosComponent, QuickToDosComponent],
  providers: [AuthGuardService],

})
export class HomeModule { }
