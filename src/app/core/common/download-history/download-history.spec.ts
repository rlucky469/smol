import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadHistory } from './download-history';

describe('DownloadHistory', () => {
  let component: DownloadHistory;
  let fixture: ComponentFixture<DownloadHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
