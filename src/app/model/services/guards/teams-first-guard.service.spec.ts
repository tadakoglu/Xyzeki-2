/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TeamsFirstGuardService } from './teams-first-guard.service';

describe('Service: TeamsFirstGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TeamsFirstGuardService]
    });
  });

  it('should ...', inject([TeamsFirstGuardService], (service: TeamsFirstGuardService) => {
    expect(service).toBeTruthy();
  }));
});
