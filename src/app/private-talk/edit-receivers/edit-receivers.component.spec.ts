/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditReceiversComponent } from './edit-receivers.component';

describe('EditReceiversComponent', () => {
  let component: EditReceiversComponent;
  let fixture: ComponentFixture<EditReceiversComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditReceiversComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditReceiversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
