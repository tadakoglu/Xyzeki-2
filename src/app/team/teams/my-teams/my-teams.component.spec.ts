import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTeamsComponent } from './my-teams.component';

describe('MyTeamsComponent', () => {
  let component: MyTeamsComponent;
  let fixture: ComponentFixture<MyTeamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyTeamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
