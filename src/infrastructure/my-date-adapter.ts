import {NativeDateAdapter} from '@angular/material';
import {Injectable} from '@angular/core';

const DEFAULT_DAY_OF_WEEK_NAMES = {
  'long': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  'short': ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  'narrow': ['S', 'M', 'T', 'W', 'T', 'F', 'S']
};
const DEFAULT_MONTH_NAMES = {
  'long': [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül',
    'Ekim', 'Kasım', 'Aralık'
  ],
  'short': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  'narrow': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
};

@Injectable()
export class MyDateAdapter extends NativeDateAdapter {

  getFirstDayOfWeek(): number {
    return 1;
  }
  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    return DEFAULT_MONTH_NAMES['long'];
  }


  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    return DEFAULT_DAY_OF_WEEK_NAMES['short'];
  }
//   format(date: Date, displayFormat: Object): string {

//     if (displayFormat === 'input') {

//         const day = date.getDate();
//         const month = date.getMonth() + 1;
//         const year = date.getFullYear();

//         return `${day}-${month}-${year}`;
//     }

//     return date.toDateString();
// }

}
