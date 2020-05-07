import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectToDosComponent } from './project-to-dos.component';

describe('ProjectToDosComponent', () => {
  let component: ProjectToDosComponent;
  let fixture: ComponentFixture<ProjectToDosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectToDosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectToDosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
