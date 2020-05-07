import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { stringify } from '@angular/compiler/src/util';

export class CustomNgbDateParserFormatter extends NgbDateParserFormatter {
	datePipe = new DatePipe('tr-TR');
	private dateFormatString: string = 'longDate'
	constructor() {
		super();
	}
	// Sadece UI biçim değiştirici olarak kullan.
	//when you select a date from picker
	format(date: NgbDateStruct): string { // NgbDateStruct(y,m,d) =>> 26 Temmuz 2019 biçim dönüşümü
		
		if (date === null) {
			return '';
		}
		try {
			//timezone burada önemli değiL sadece biçim değiştireceğiz, sadece locale önemli oda global olarak appmoduleden çekilir.
            return this.datePipe.transform(new Date(Date.UTC(date.year, date.month -1, date.day)), this.dateFormatString,'+0000'); // timezone(local system timezone default), locale(set up in AppModule as Turkish/Turkey)
            //Ref: https://angular.io/api/common/DatePipe   
		} catch (e) {
			return '';
		}
	}

	//sadece UI biçim değiştirici olarak kullan
	//when you write a date into the textbox.
	parse(value: string): NgbDateStruct { // 26 Temmuz 2019 =>> NgbDateStruct(y,m,d) biçim dönüşümü
		let returnVal: NgbDateStruct; 
		if (!value) {
			returnVal = null; 
		} else {
			try {
				let date= value.split(' ');
				let gun:number= Number.parseInt(date[0])
				let ay:number;
				switch(date[1].toLowerCase())
				{
					case 'ocak': ay=1; break;
					case 'şubat': ay=2; break;
					case 'mart': ay=3; break;
					case 'nisan': ay=4; break;
					case 'mayıs': ay=5; break;
					case 'haziran': ay=6; break;
					case 'temmuz': ay=7; break;
					case 'ağustos': ay=8; break;
					case 'eylül': ay=9; break;
					case 'ekim': ay=10; break;
					case 'kasım': ay=11; break;
					case 'aralık': ay=12; break;

				}

				let yil:number =  Number.parseInt(date[2]);


				returnVal = { year: yil, month: ay, day: gun };
			} catch (e) {
				returnVal = null;
			}
		}
		return returnVal;
	}
}
