/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TeamMembersGuardService } from './team-members-guard.service';

describe('Service: TeamMembersGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TeamMembersGuardService]
    });
  });

  it('should ...', inject([TeamMembersGuardService], (service: TeamMembersGuardService) => {
    expect(service).toBeTruthy();
  }));
});
