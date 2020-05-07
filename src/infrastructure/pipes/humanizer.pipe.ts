import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'humanizer',
  pure:true /* invoke pipe also when forloop item updated, run it each  change detection cycle */
})
export class HumanizerPipe implements PipeTransform {

  datePipe = new DatePipe('tr-TR');
  transform(value: string, args?: any): string { // value is 1993-07-10T08:00+0300
    
    //ÖNEMLİ NOT.
    // # todo, bugün'den saat kavramını kaldır, aksi takdirde buradan gelen saat tarihi kıl payı bir adım ileri veya geri atabiliyor
    //yani yarın'a gitmesi gereken görev diğer güne, bugünün görevi'de yarın olarak gösterilebiliyor bazen. !!!!

    if(!value)
    return '';
    //Convert value to Today,Tomorrow, ... 
    //let tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1)
    //getTime() always uses UTC for time representation. For example, a client browser in one timezone, getTime() will be the same as a client browser in any other timezone.
    let today = new Date() // UNIX time stamp
    today.setHours( 0,0,0,0 ); // unless you do that, it can sometimes wrongly calculate the mat.floor value.
    //today.setTime(1563653820000) // you can retrieve utc unix time stamp from server to avoid suffering from wrong client dates. //https://www.epochconverter.com/
    //JS/TS can calculate timezone wrongly if your local date(windows) set to a wrong date. it find the offset from unix stamp - your local time
    let date = new Date(value)
    date.setHours( 0,0,0,0 ); 
    let diff = ((today.getTime() - date.getTime()) / 1000)
    let daydiff= Math.floor( Math.abs(diff) / 86400); // -86401
  
    // 1 GÜN = 86400 SANİYE
    // bugün büyük ise (0,1) dahil pozitif bir sayı çıkar(daydiff)
    // bu durumda 0.15 0 olarak yuvarlanır. bugündür yani 0'dan büyük sonuçlarda sistem doğru.

    //diff 0'dan küçük çıkarsa sistem düzgün çalışmaz.
    // bugün küçük ise, örn. -0.15, -1'e yuvarlanır. yani yanlış. 0 olmalı
    // bugün küçük ise, örn. -1.15, -2'ye yuvarlanır. yani yanlış. -1 olmalı
    // bugün küçük ise, örn. -2.15, -3'e yuvarlanır. yani yanlış. -2 olmalı.

    // if (isNaN(daydiff) || daydiff < 0 || daydiff >= 31)
    // return this.datePipe.transform(value,'d/M/yy', '+0300')
    if (diff > 0 && daydiff == 3)
    return "3 gün önce" 
    if (diff > 0 && daydiff == 2)
    return "2 gün önce"
    if (diff > 0 && daydiff == 1)
      return "Dün"
    if (diff >= 0  && daydiff == 0)
      return "Bugün" 

    else if (diff <0 && daydiff == 1)
      return "Yarın"  + this.addDay(value);
    else if (diff <0 && daydiff == 2) {
      let twoDaysLater = new Date(); twoDaysLater.setDate(today.getDate() + 2);
      let day = twoDaysLater.getDay();
      return this.getDay(day)+ this.addDate(value);
    }
    else if (diff <0 && daydiff == 3) {
      let threeDaysLater = new Date(); threeDaysLater.setDate(today.getDate() + 3);
      let day = threeDaysLater.getDay();
      return this.getDay(day)+ this.addDate(value);
    }
    else if (diff <0 && daydiff == 4) {
      let fourDaysLater = new Date(); fourDaysLater.setDate(today.getDate() + 4);
      let day = fourDaysLater.getDay();
      return this.getDay(day)+ this.addDate(value);
    }
    else if (diff <0 && daydiff == 5) {
      let fiveDaysLater = new Date(); fiveDaysLater.setDate(today.getDate() + 5);
      let day = fiveDaysLater.getDay();
      return this.getDay(day)+ this.addDate(value);
    }
    else if (diff <0 && daydiff == 6) {
      let sixDaysLater = new Date(); sixDaysLater.setDate(today.getDate() + 6);
      let day = sixDaysLater.getDay();
      return this.getDay(day)+ this.addDate(value);
    }
    else if (diff <0 && daydiff == 7) {
      return 'Haftaya Bugün'+ this.addDate(value);
    }  

    else
      return this.datePipe.transform(value, 'd/M/yy', '+0300');
  }
  addDate(value){
    return " (" + this.datePipe.transform(value, 'd/M', '+0300') + ")"
  }
  addDay(value){
    return " (" + this.datePipe.transform(value, 'EE', '+0300') + ")"
  }

  getDay(day){
    switch (day) {
      case 0:
        return 'Pazar';
      case 1:
        return 'Pazartesi';
      case 2:
        return 'Salı';
      case 3:
        return 'Çarşamba';
      case 4:
        return 'Perşembe';
      case 5:
        return 'Cuma';
      case 6:
        return 'Cumartesi';
    }
  }

}
