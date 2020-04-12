import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvGeneratorComponent } from './env-generator.component';

describe('EnvGeneratorComponent', () => {
  let component: EnvGeneratorComponent;
  let fixture: ComponentFixture<EnvGeneratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnvGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
