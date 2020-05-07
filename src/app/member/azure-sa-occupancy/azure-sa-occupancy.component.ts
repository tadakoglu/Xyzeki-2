import { Component, OnInit, Input, SimpleChanges, OnDestroy, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { MemberLicenseService } from 'src/app/model/services/member-license.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-azure-sa-occupancy',
  templateUrl: './azure-sa-occupancy.component.html',
  styleUrls: ['./azure-sa-occupancy.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AzureSaOccupancyComponent implements OnInit, OnDestroy, OnChanges {

  constructor(private service: MemberLicenseService) { }

  public azureSaUsedSizeInBytes = 0;
  private subscription: Subscription;

  ngOnInit(): void {
    this.load();
  }

  @Input()
  set setLicenseId(id) {
    this.licenseId = id;
  }
  get getLicenseId() {
    return this.licenseId;
  }

  @Input()
  public licenseId: string;

  ngOnChanges(changes: SimpleChanges) {
    if (this.licenseId) {
      this.load();
      console.log(this.licenseId);
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  loading: boolean = true;
  load() {
    this.subscription = this.service.usedStorage(this.getLicenseId).subscribe(mlus => { 
      
      this.azureSaUsedSizeInBytes = mlus.AzureSaUsedSizeInBytes; this.loading = false; });
  }
}
