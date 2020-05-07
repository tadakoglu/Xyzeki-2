import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesComponent } from './files/files.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MemberModule } from '../member/member.module';
import { NavbarModule } from '../navbar/navbar.module';
import { PipesModule } from 'src/infrastructure/pipes/pipes.module';
import { ContainersComponent } from './containers/containers.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { UiToolsModule } from '../ui-tools/ui-tools.module';
import { FilesStatisticsComponent } from './files-statistics/files-statistics.component';


@NgModule({
  declarations: [FilesComponent,ContainersComponent,FilesStatisticsComponent],
  imports: [
    CommonModule, FormsModule, NgbModule, NavbarModule, MemberModule,
    PipesModule, InfiniteScrollModule, UiToolsModule,
    RouterModule
  ], 

  exports:[FilesComponent,ContainersComponent]
})
export class FilesModule { }
