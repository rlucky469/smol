import { Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import {
  selectAvailableCredits,
  selectIsLowCredits,
  selectIsOutOfCredits,
  selectNextExpiry,
  selectRemainingPercent,
  selectTotalCredits,
  selectUsedCredits,
  selectWalletLoaded,
} from '../../../store/wallet/wallet.selectors';

// Rendered as <li app-credit-menu> inside the header top bar list
@Component({
  selector: 'li[app-credit-menu]',
  imports: [NgbDropdownModule, RouterLink, DecimalPipe, DatePipe],
  templateUrl: './credit-menu.html',
  styleUrl: './credit-menu.scss',
})
export class CreditMenu {
  private store = inject(Store);

  loaded = this.store.selectSignal(selectWalletLoaded);
  available = this.store.selectSignal(selectAvailableCredits);
  used = this.store.selectSignal(selectUsedCredits);
  total = this.store.selectSignal(selectTotalCredits);
  remainingPercent = this.store.selectSignal(selectRemainingPercent);
  nextExpiry = this.store.selectSignal(selectNextExpiry);
  isLow = this.store.selectSignal(selectIsLowCredits);
  isEmpty = this.store.selectSignal(selectIsOutOfCredits);
}
