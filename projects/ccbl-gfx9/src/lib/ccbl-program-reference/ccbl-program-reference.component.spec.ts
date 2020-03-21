import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblProgramReferenceComponent } from './ccbl-program-reference.component';

describe('CcblProgramReferenceComponent', () => {
  let component: CcblProgramReferenceComponent;
  let fixture: ComponentFixture<CcblProgramReferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblProgramReferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblProgramReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
