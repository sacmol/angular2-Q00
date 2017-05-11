import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchfdiffcomponentComponent } from './searchfdiffcomponent.component';

describe('SearchfdiffcomponentComponent', () => {
  let component: SearchfdiffcomponentComponent;
  let fixture: ComponentFixture<SearchfdiffcomponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchfdiffcomponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchfdiffcomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
