import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneHeatingComponent } from './scene-heating.component';

describe('SceneHeatingComponent', () => {
  let component: SceneHeatingComponent;
  let fixture: ComponentFixture<SceneHeatingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SceneHeatingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SceneHeatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
