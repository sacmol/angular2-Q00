import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchufComponent } from './searchuf.component';

describe('SearchufComponent', () => {
  let component: SearchufComponent;
  let fixture: ComponentFixture<SearchufComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchufComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchufComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
