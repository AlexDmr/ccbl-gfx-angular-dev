import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneHomeComponent } from './scene-house.component';

describe('SceneHomeComponent', () => {
  let component: SceneHomeComponent;
  let fixture: ComponentFixture<SceneHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SceneHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SceneHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
