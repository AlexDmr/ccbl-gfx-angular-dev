import { TestBed } from '@angular/core/testing';

import { AuthExpeGuard } from './auth-expe.guard';

describe('AuthExpeGuard', () => {
  let guard: AuthExpeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthExpeGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
