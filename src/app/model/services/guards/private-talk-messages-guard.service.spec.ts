/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PrivateTalkMessagesGuardService } from './private-talk-messages-guard.service';

describe('Service: PrivateTalkMessagesGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrivateTalkMessagesGuardService]
    });
  });

  it('should ...', inject([PrivateTalkMessagesGuardService], (service: PrivateTalkMessagesGuardService) => {
    expect(service).toBeTruthy();
  }));
});
