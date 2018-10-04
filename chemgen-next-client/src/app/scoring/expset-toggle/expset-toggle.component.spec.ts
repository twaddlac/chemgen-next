import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpsetToggleComponent } from './expset-toggle.component';

describe('ExpsetToggleComponent', () => {
  let component: ExpsetToggleComponent;
  let fixture: ComponentFixture<ExpsetToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpsetToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpsetToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
