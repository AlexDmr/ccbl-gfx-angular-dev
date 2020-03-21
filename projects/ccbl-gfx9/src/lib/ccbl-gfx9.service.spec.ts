import { TestBed } from '@angular/core/testing';

import { CcblGfx9Service } from './ccbl-gfx9.service';

describe('CcblGfx9Service', () => {
  let service: CcblGfx9Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcblGfx9Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
