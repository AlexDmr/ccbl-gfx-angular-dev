import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblVariableDescriptionComponent } from './ccbl-variable-description.component';

describe('CcblVariableDescriptionComponent', () => {
  let component: CcblVariableDescriptionComponent;
  let fixture: ComponentFixture<CcblVariableDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblVariableDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblVariableDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
