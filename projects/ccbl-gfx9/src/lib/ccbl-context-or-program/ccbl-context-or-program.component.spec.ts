import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblContextOrProgramComponent } from './ccbl-context-or-program.component';

describe('CcblContextOrProgramComponent', () => {
  let component: CcblContextOrProgramComponent;
  let fixture: ComponentFixture<CcblContextOrProgramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblContextOrProgramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblContextOrProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
