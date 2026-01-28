import { TestBed } from '@angular/core/testing';

import { OneService } from './one.service';

describe('OneService', () => {
  let service: OneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
