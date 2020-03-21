import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblGfx9Component } from './ccbl-gfx9.component';

describe('CcblGfx9Component', () => {
  let component: CcblGfx9Component;
  let fixture: ComponentFixture<CcblGfx9Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblGfx9Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblGfx9Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
