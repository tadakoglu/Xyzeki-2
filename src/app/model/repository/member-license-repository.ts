import { Injectable } from '@angular/core';
import { IMemberLicenseRepository } from '../abstract/i-member-license-repository';
import { MemberLicense } from '../member-license.model';
import { MemberLicenseSM } from '../member-license-sm.model';
import { MemberLicenseService } from '../services/member-license.service';
import { flatMap, concatMap } from 'rxjs/operators';
import { DataService } from '../services/shared/data.service';


@Injectable()
export class MemberLicenseRepository implements IMemberLicenseRepository {
    constructor(private service: MemberLicenseService, private dataService: DataService) {
        this.loadLicenseRelateds();
     
        this.dataService.reloadAllOnTeamDestroyEvent.subscribe(() => this.loadLicenseRelateds());
    }
    loadLicenseRelateds() {  // ### reload this when team component destroyed.

        this.service.myLicense().pipe(concatMap((lic) => {
            //this.memberLicense = lic;
            Object.assign(this.memberLicense, lic);

            this.AzureSaSizeInGb = lic.AzureSaSizeInGb;
            return this.service.usedStorage(lic.LicenseId);
        })).subscribe(mlus => this.AzureSaUsedSizeInBytes = mlus.AzureSaUsedSizeInBytes);

        this.service.accessGranted().subscribe(permission => {
            this.accessGranted = permission;
        })
        this.service.primaryAccessGranted().subscribe(permission => {
            this.primaryAccessGranted = permission;
        })

    }
    private AzureSaUsedSizeInBytes: number = 0;
    private AzureSaSizeInGb: number = 0;

    getOccupancyRate(): number {
        return 100 * this.getUsedGB() / this.getTotalGB(); // Percentage
    }
    getUsedGB(): number {
        return this.AzureSaUsedSizeInBytes / 1073741824;
    }
    getTotalGB(): number {
        return this.AzureSaSizeInGb;
    }

    private accessGranted: boolean = false;
    private primaryAccessGranted: boolean = false;

    private memberLicense: MemberLicense = new MemberLicense(null, null, null, null, null, null, null, null, null, null, null, null);


    getAccessGranted(): boolean {
        return this.accessGranted;
    }
    getPrimaryAccessGranted(): boolean {
        return this.primaryAccessGranted;
    }

    getMemberLicense(): MemberLicense {
        return this.memberLicense;
    }
    removeMemberLicenseForJoinedTeamMember() {
        this.memberLicense = new MemberLicense(null, null, null, null, null, null, null, null, null, null, null, null);
    }



}
