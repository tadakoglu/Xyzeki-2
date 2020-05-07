import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PipesModule } from 'src/infrastructure/pipes/pipes.module';
import { AuthGuardService } from '../model/services/guards/auth-guard.service';
import { TaskCommentsComponent } from './task-comments/task-comments.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@NgModule({
  declarations: [TaskCommentsComponent],
  imports: [
    CommonModule, FormsModule, NgbModule, DragDropModule, PipesModule,
     MatDialogModule, PickerModule,
     RouterModule
  ],
  providers: [AuthGuardService],
  entryComponents: [TaskCommentsComponent]
})
export class CommentModule { }
