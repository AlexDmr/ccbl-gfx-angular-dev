import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceLampComponent } from './device-lamp.component';

describe('DeviceLampComponent', () => {
  let component: DeviceLampComponent;
  let fixture: ComponentFixture<DeviceLampComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceLampComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceLampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
