import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventerComponent } from './eventer.component';

describe('EventerComponent', () => {
  let component: EventerComponent;
  let fixture: ComponentFixture<EventerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
