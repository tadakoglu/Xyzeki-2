/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CommentSignalrService } from './comment-signalr.service';

describe('Service: CommentSignalr', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommentSignalrService]
    });
  });

  it('should ...', inject([CommentSignalrService], (service: CommentSignalrService) => {
    expect(service).toBeTruthy();
  }));
});
