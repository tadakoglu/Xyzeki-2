/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MemberLicenseService } from './member-licenses.service';

describe('Service: MemberLicenses', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MemberLicenseService]
    });
  });

  it('should ...', inject([MemberLicenseService], (service: MemberLicenseService) => {
    expect(service).toBeTruthy();
  }));
});
