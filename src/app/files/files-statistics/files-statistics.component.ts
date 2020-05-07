import { Component, OnInit, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { MemberLicense } from 'src/app/model/member-license.model';

@Component({
  selector: 'app-files-statistics',
  templateUrl: './files-statistics.component.html',
  styleUrls: ['./files-statistics.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FilesStatisticsComponent implements OnInit {

  constructor(private mLicenseRepository: MemberLicenseRepository,) { }
  ngOnInit() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }
  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  leftPerc(val): number {
    let v = Number(val);
    return 100 - v;
  }

  get usedGB(): number {
    return this.mLicenseRepository.getUsedGB();
  }
  get totalGB(): number {
    return this.mLicenseRepository.getTotalGB();
  }
  get occupancyRate(): number {
    return this.mLicenseRepository.getOccupancyRate();
  }

  get circum1(): number { // x
    return parseInt(this.mLicenseRepository.getOccupancyRate().toFixed());
  }
  get circum2(): number { // 100 -x
    return 100 - parseInt(this.mLicenseRepository.getOccupancyRate().toFixed());
  }
  get myLicense(): MemberLicense {
    return this.mLicenseRepository.getMemberLicense();
  }
}
