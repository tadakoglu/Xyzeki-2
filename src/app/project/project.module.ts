import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsComponent } from './projects/projects.component';
import { MyProjectsComponent } from './projects/my-projects/my-projects.component';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UiToolsModule } from '../ui-tools/ui-tools.module';
import { PipesModule } from 'src/infrastructure/pipes/pipes.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CommentModule } from '../comment/comment.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProjectToDosComponent } from './projects/project-to-dos/project-to-dos.component';
import { MatIconModule } from '@angular/material/icon'


@NgModule({
  declarations: [ProjectsComponent, MyProjectsComponent, ProjectToDosComponent],
  imports: [
    CommonModule, FormsModule, NgbModule,
    UiToolsModule, PipesModule, DragDropModule, CommentModule, MatCheckboxModule, MatIconModule,
    RouterModule
  ],
  exports: [ProjectsComponent],
  providers: []
})
export class ProjectModule { }
