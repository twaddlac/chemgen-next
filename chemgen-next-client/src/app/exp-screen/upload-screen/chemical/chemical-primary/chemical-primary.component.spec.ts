import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemicalPrimaryComponent } from './chemical-primary.component';

describe('ChemicalPrimaryComponent', () => {
  let component: ChemicalPrimaryComponent;
  let fixture: ComponentFixture<ChemicalPrimaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChemicalPrimaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChemicalPrimaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
