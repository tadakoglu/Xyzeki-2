/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MemberSettingService } from './member-setting.service';

describe('Service: MemberSetting', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MemberSettingService]
    });
  });

  it('should ...', inject([MemberSettingService], (service: MemberSettingService) => {
    expect(service).toBeTruthy();
  }));
});
