import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeviceComponent } from './dialog-device.component';

describe('DialogDeviceComponent', () => {
  let component: DialogDeviceComponent;
  let fixture: ComponentFixture<DialogDeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDeviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
