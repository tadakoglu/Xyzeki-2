import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AdminRepository } from 'src/app/model/repository/admin-repository';
import { MemberShared } from 'src/app/model/member-shared.model';
import { MemberLicense } from 'src/app/model/member-license.model';
import { NgForm } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { MemberLicenseService } from 'src/app/model/services/member-license.service';

@Component({
  selector: 'app-license-management',
  templateUrl: './license-management.component.html',
  styleUrls: ['./license-management.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class LicenseManagementComponent {

  constructor(private repository: AdminRepository, private memberShared: MemberShared) { }

  get allLicenses(): MemberLicense[] {
    return this.repository.getAllLicenses();
  }

  modelSent: boolean = false;
  modelSubmitted: boolean = false; // That's for validation method

  public licenseModel: MemberLicense = new MemberLicense(null, null, null, null, null, null, null, null, null, null, null,null);
  addLicense(licenseForm: NgForm) {
    this.modelSubmitted = true;
    if (licenseForm.valid) {
      this.repository.newLicense(this.licenseModel);
      this.modelSent = true;
      this.modelSubmitted = false;
      this.licenseModel = new MemberLicense(null, null, null, null, null, null, null, null, null, null, null, null);
    }
  }
  deleteLicense(licenseId){
    this.repository.deleteLicense(licenseId);
  }

  newLicensePanelOpen: boolean = false;
  toggleNewLicensePanel() {
    if (this.newLicensePanelOpen == false) {
      this.newLicensePanelOpen = true;
    }
    else {
      this.newLicensePanelOpen = false;
    }
  }

  startDate: NgbDateStruct = null
  endDate: NgbDateStruct = null;

  //Important Note: Validate date model format in UI with regex, because NgbDateStruct value can be 'f',1993, 22 only, because it fires on change event.

  onSelectStartDate(date: NgbDateStruct) {
    if (date != null) {
      this.startDate = date;
      let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
      let day: string = date.day < 10 ? '0' + date.day : date.day.toString()
      this.licenseModel.StartDate = `${date.year}-${month}-${day}` + `T00:00+0300`
    }
  }
  onSelectEndDate(date: NgbDateStruct) {
    if (date != null) {
      this.endDate = date;
      let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
      let day: string = date.day < 10 ? '0' + date.day : date.day.toString()
      this.licenseModel.EndDate = `${date.year}-${month}-${day}` + `T00:00+0300`
    }
  }
}
