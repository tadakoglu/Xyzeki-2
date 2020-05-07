/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MyPrivateTalksComponent } from './my-private-talks.component';

describe('MyPrivateTalksComponent', () => {
  let component: MyPrivateTalksComponent;
  let fixture: ComponentFixture<MyPrivateTalksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyPrivateTalksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPrivateTalksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
