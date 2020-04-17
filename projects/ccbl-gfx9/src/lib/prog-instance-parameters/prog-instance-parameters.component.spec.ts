import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgInstanceParametersComponent } from './prog-instance-parameters.component';

describe('ProgInstanceParametersComponent', () => {
  let component: ProgInstanceParametersComponent;
  let fixture: ComponentFixture<ProgInstanceParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgInstanceParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgInstanceParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
