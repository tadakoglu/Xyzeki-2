import { Injectable } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class XyzekiDateTimeInfra {

    UTCLocale: string = this.convertMinutesToToHours(new Date().getTimezoneOffset()) //  -180 >  "+0300"

    convertMinutesToToHours(minutes) {
        let sign = minutes <= 0 ? '+' : '-'
        minutes = Math.abs(minutes);
        let h = Math.floor(minutes / 60);
        let m = minutes % 60;
        let h2 = h < 10 ? '0' + h : h.toString();
        let m2 = m < 10 ? '0' + m : m.toString();
        return sign + h2 + m2;
    }

    get getUTCLocale(): string {
        return this.UTCLocale;
    }

    get todayDate(): [NgbDateStruct, string] {  // {day:2, month:2: year:1992}, 1993-07-26T08:00:00+0300 > 1993-07-26

        let today = new Date(); // Use system now if server doesnt have a now.        
        today.setHours(0, 0, 0, 0); // Conver to UTC(based 0000) and set hours/minute/second to 0

        return [{ day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() }, this.toString(today)];
    }
    get tomorrowDate(): [NgbDateStruct, string] {  // {day:2, month:2: year:1992}, 1993-07-26T08:00:00+0300 > 1993-07-26

        let today = new Date(); // Use system now if server doesnt have a now.        
        today.setHours(0, 0, 0, 0); // Conver to UTC(based 0000) and set hours/minute/second to 0

        let tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);

        tomorrow.setDate(today.getDate() + 1);

        return [{ day: tomorrow.getDate(), month: tomorrow.getMonth() + 1, year: tomorrow.getFullYear() }, this.toString(tomorrow)];
    }


    toString(date: Date) { //"2019-12-07T10:20:25.292Z" > "2019-12-07T10:20:25.292+0000"
        let datetime = date.toISOString().split('Z')[0];
        return datetime + '+0000'
    }
    getToDateString(dateObj: Date) {
        //dateObj.setHours(0, 0, 0, 0);
        let date: NgbDateStruct = { day: dateObj.getDate(), month: dateObj.getMonth() + 1, year: dateObj.getFullYear() }

        let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
        let day: string = date.day < 10 ? '0' + date.day : date.day.toString()

        let dateString = `${date.year}-${month}-${day}`;
        return dateString;

    }
    getToTimeString(dateObj: Date) {
        let time: NgbTimeStruct = { hour: dateObj.getHours(), minute: dateObj.getMinutes(), second: dateObj.getSeconds() }

        let hour: string = time.hour < 10 ? '0' + time.hour : time.hour.toString()
        let minute: string = time.minute < 10 ? '0' + time.minute : time.minute.toString()
        let second: string = time.second < 10 ? '0' + time.second : time.second.toString()
        let timeString = `${hour}:${minute}:${second}`;
        return timeString;

    }
    setupDate(datetimeToChange: string, ToDate: string): string { //1993-07-26T08:00:00+0300       

        if (isNullOrUndefined(ToDate))
            return null;

        if (isNullOrUndefined(datetimeToChange))
            return ToDate + 'T00:00:00' + this.UTCLocale
        else {  // Parse datetime and set date
            let dt = datetimeToChange.split('T');
            //let datePart: string = dt[0];

            let timeAndUTCPart = dt[1].split('+');

            if (timeAndUTCPart[0] == dt[1]) // If same, try to split with -
                timeAndUTCPart = dt[1].split('-');

            let timeFixed = timeAndUTCPart[0];

            let result = ToDate + `T${timeFixed}${this.UTCLocale}`
            return result;
        }
    }
    setupTime(datetimeToChange: string, ToTime: string): string { //1993-07-26T08:00:00+0300
        //let UTCLocale = '+0300';

        if (isNullOrUndefined(ToTime))
            ToTime = '00:00:00'

        if (isNullOrUndefined(datetimeToChange)) // Ignore time if a date not exists, exception handling
            return null;
        else { // Parse datetime and set time
            let dt = datetimeToChange.split('T');
            let datePartFixed: string = dt[0];

            //let timeAndUTCPart = dt[1].split('+');

            //let time = timeAndUTCPart[0];
            //let utcFixed = timeAndUTCPart[1];

            let result = datePartFixed + `T${ToTime}${this.UTCLocale}`
            return result;
        }
    }
    getTime() {

    }

}