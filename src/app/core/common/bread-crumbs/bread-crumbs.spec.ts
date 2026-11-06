import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadCrumbs } from './bread-crumbs';

describe('BreadCrumbs', () => {
  let component: BreadCrumbs;
  let fixture: ComponentFixture<BreadCrumbs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadCrumbs],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadCrumbs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
