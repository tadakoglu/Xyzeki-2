/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { QuickToDoCommentsService } from './quick-to-do-comments.service';

describe('Service: QuickToDoComments', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuickToDoCommentsService]
    });
  });

  it('should ...', inject([QuickToDoCommentsService], (service: QuickToDoCommentsService) => {
    expect(service).toBeTruthy();
  }));
});
