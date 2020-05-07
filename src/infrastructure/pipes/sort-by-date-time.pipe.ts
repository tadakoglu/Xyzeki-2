import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByDateTime'
})
export class SortByDateTimePipe implements PipeTransform {
  transform(value: any, propertyName: string, sortType: string = "asc"): any {
    let sortedValues;
    // if (value == null)
    //   return;
    // if (value.Length == 1) {
    //   return;
    // }
    if (sortType == "asc") {
      let sortFuncAsc = (a, b) => new Date(a[propertyName]).getTime() - new Date(b[propertyName]).getTime();
      sortedValues = value.sort(sortFuncAsc);
    } else {
      let sortFuncDsc = (a, b) => new Date(b[propertyName]).getTime() - new Date(a[propertyName]).getTime();
      sortedValues = value.sort(sortFuncDsc);
    }

    return sortedValues;
  }
}

