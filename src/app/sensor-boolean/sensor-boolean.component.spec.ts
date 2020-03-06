import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorBooleanComponent } from './sensor-boolean.component';

describe('SensorBooleanComponent', () => {
  let component: SensorBooleanComponent;
  let fixture: ComponentFixture<SensorBooleanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorBooleanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorBooleanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
