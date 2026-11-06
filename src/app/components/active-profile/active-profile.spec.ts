import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveProfile } from './active-profile';

describe('ActiveProfile', () => {
  let component: ActiveProfile;
  let fixture: ComponentFixture<ActiveProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
