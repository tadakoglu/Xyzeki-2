/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { QuickToDosComponent } from './quick-to-dos.component';

describe('QuickToDosComponent', () => {
  let component: QuickToDosComponent;
  let fixture: ComponentFixture<QuickToDosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickToDosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickToDosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
