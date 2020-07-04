import { TestBed } from '@angular/core/testing';

import { CcblValidatorService } from './ccbl-validator.service';

describe('CcblValidatorService', () => {
  let service: CcblValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcblValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
