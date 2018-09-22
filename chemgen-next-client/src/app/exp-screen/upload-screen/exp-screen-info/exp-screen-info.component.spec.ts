import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpScreenInfoComponent } from './exp-screen-info.component';

describe('ExpScreenInfoComponent', () => {
  let component: ExpScreenInfoComponent;
  let fixture: ComponentFixture<ExpScreenInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpScreenInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpScreenInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
