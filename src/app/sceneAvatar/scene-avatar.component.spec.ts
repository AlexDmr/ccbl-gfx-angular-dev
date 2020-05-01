import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneAvatarComponent } from './scene-avatar.component';

describe('SceneComponent', () => {
  let component: SceneAvatarComponent;
  let fixture: ComponentFixture<SceneAvatarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SceneAvatarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SceneAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});