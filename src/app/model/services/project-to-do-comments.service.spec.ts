/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProjectToDoCommentsService } from './project-to-do-comments.service';

describe('Service: ProjectToDoComments', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectToDoCommentsService]
    });
  });

  it('should ...', inject([ProjectToDoCommentsService], (service: ProjectToDoCommentsService) => {
    expect(service).toBeTruthy();
  }));
});
