import { Injectable } from '@angular/core';
import { MemberLicense } from '../member-license.model';




@Injectable()
export abstract class IMemberLicenseRepository { // Include only public members here.
    
    abstract getMemberLicense(): MemberLicense

    // abstract validateLicense(memberLicenseSM: MemberLicenseSM)

}
