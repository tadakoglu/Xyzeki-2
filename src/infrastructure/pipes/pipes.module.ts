import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HumanizerPipe } from './humanizer.pipe';
import { SortByDateTimePipe } from './sort-by-date-time.pipe';
import { ReplaceEmojisPipe } from './replace-emojis.pipe';

@NgModule({
  declarations: [HumanizerPipe, SortByDateTimePipe, ReplaceEmojisPipe],
  imports: [
    CommonModule
  ], exports: [HumanizerPipe, SortByDateTimePipe, ReplaceEmojisPipe],
})
export class PipesModule { }
