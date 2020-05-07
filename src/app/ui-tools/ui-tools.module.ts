import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssignAutocompleteComponent } from './assign-autocomplete/assign-autocomplete.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { SwitchDayComponent } from './switch-day/switch-day.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule, MatInputModule, MatRippleModule } from '@angular/material';
import { MatSearchBarComponent } from './mat-search-bar/mat-search-bar.component';
import { SwitchHourComponent } from './switch-hour/switch-hour.component';

@NgModule({
  declarations: [AssignAutocompleteComponent, SwitchDayComponent, MatSearchBarComponent, SwitchHourComponent],
  imports: [
    CommonModule, FormsModule, NgbModule, DragDropModule,
    MatIconModule, MatInputModule, MatRippleModule, ReactiveFormsModule,
    RouterModule,
  ],
  exports: [AssignAutocompleteComponent, SwitchDayComponent, MatSearchBarComponent, SwitchHourComponent]
})
export class UiToolsModule { }
