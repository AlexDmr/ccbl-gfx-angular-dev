import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblProgramApiComponent } from './ccbl-program-api.component';

describe('CcblProgramApiComponent', () => {
  let component: CcblProgramApiComponent;
  let fixture: ComponentFixture<CcblProgramApiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblProgramApiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblProgramApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
