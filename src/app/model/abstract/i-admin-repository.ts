import { Injectable } from '@angular/core';
import { MemberLicense } from '../member-license.model';

@Injectable()
export abstract class IAdminRepository {
    
    abstract getAllLicenses(): MemberLicense[]

    abstract newLicense(memberLicense: MemberLicense)

}
