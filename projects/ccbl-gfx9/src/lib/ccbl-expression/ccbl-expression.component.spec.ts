import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblExpressionComponent } from './ccbl-expression.component';

describe('CcblExpressionComponent', () => {
  let component: CcblExpressionComponent;
  let fixture: ComponentFixture<CcblExpressionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblExpressionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblExpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
