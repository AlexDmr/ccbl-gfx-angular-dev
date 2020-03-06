import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorScalarComponent } from './sensor-scalar.component';

describe('SensorScalarComponent', () => {
  let component: SensorScalarComponent;
  let fixture: ComponentFixture<SensorScalarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorScalarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorScalarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
