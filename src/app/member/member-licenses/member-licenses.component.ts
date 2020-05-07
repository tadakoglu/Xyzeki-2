import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { MemberLicense } from 'src/app/model/member-license.model';
import { MemberLicenseSM } from 'src/app/model/member-license-sm.model';
import { MemberShared } from 'src/app/model/member-shared.model';
import { MemberLicenseService } from 'src/app/model/services/member-license.service';

@Component({
  selector: 'app-member-licenses',
  templateUrl: './member-licenses.component.html',
  styleUrls: ['./member-licenses.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MemberLicensesComponent {

  constructor(private repository: MemberLicenseRepository, public memberShared: MemberShared) { }
  totalEmployee;
  totalMonths;
  public licenceModel: any;
  onSelectDate(date: NgbDateStruct) {
    if (date != null) {
      this.date = date;
      let month: string = date.month < 10 ? '0' + date.month : date.month.toString();
      let day: string = date.day < 10 ? '0' + date.day : date.day.toString();
      this.licenceModel.Date = `${date.year}-${month}-${day}`;
    }
  }
  date: NgbDateStruct = null;

  get myLicense(): MemberLicense {
    return this.repository.getMemberLicense();
  }

  public memberLicenseModel: MemberLicenseSM = new MemberLicenseSM(this.memberShared.Username,""); // Fill this form with ng form 

  // validateLicense() {
  //   this.repository.validateLicense(this.memberLicenseModel)
  // }


}
