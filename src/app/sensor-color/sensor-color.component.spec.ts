import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorColorComponent } from './sensor-color.component';

describe('SensorColorComponent', () => {
  let component: SensorColorComponent;
  let fixture: ComponentFixture<SensorColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
