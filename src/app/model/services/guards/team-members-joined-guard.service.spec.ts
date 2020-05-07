/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TeamMembersJoinedGuardService } from './team-members-joined-guard.service';

describe('Service: TeamMembersJoinedGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TeamMembersJoinedGuardService]
    });
  });

  it('should ...', inject([TeamMembersJoinedGuardService], (service: TeamMembersJoinedGuardService) => {
    expect(service).toBeTruthy();
  }));
});
