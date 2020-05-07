import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatIconModule,
  MatInputModule,
  MatRippleModule
} from '@angular/material';
import { QuickSearchComponent } from './quick-search.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatRippleModule,

    //Reactive form
    ReactiveFormsModule
  ],
  exports: [QuickSearchComponent],
  declarations: [QuickSearchComponent]
})
export class QuickSearchModule { }