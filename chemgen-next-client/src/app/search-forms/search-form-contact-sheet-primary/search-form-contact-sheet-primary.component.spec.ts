import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormContactSheetPrimaryComponent } from './search-form-contact-sheet-primary.component';

describe('SearchFormContactSheetPrimaryComponent', () => {
  let component: SearchFormContactSheetPrimaryComponent;
  let fixture: ComponentFixture<SearchFormContactSheetPrimaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormContactSheetPrimaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormContactSheetPrimaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
