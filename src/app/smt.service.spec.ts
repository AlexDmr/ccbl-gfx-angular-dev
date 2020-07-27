import { TestBed } from '@angular/core/testing';

import { SmtService } from './smt.service';

describe('SmtService', () => {
  let service: SmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
