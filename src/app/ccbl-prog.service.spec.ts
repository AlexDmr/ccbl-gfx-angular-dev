import { TestBed } from '@angular/core/testing';

import { CcblProgService } from './ccbl-prog.service';

describe('CcblProgService', () => {
  let service: CcblProgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcblProgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
