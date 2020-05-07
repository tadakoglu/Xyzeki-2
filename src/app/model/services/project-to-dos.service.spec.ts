import { TestBed } from '@angular/core/testing';

import { ProjectToDosService } from './project-to-dos.service';

describe('ProjectToDosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectToDosService = TestBed.get(ProjectToDosService);
    expect(service).toBeTruthy();
  });
});
