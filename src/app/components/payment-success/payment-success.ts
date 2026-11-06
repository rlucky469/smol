import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, catchError, exhaustMap, of, take, takeWhile, tap, timer } from 'rxjs';
import { BreadCrumbs } from '../../core/common/bread-crumbs/bread-crumbs';
import { Billing } from '../../core/services/billing';
import { WalletActions } from '../../store/wallet/wallet.actions';
import { selectAvailableCredits } from '../../store/wallet/wallet.selectors';

const POLL_MS = 10_000; // hit the API every 10 seconds
const MAX_WAIT_MS = 5 * 60_000; // give up after 5 minutes
const MAX_TICKS = MAX_WAIT_MS / POLL_MS + 1; // first check happens immediately

@Component({
  selector: 'app-payment-success',
  imports: [RouterLink, CurrencyPipe, DecimalPipe],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.scss',
})
export class PaymentSuccess implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private billing = inject(Billing);

  state = signal<'checking' | 'success'>('checking');
  payment = signal<any | null>(null);
  available = this.store.selectSignal(selectAvailableCredits);

  private sessionId = '';
  private sub?: Subscription;

  ngOnInit(): void {

    document.title = 'Payment Status - fundsforNGOs Premium';
    window.scrollTo(0, 0);
    debugger; 
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id') ?? '';
    if (!this.sessionId) {
      this.router.navigate(['/plans'], { replaceUrl: true });
      return;
    }

    this.sub = timer(0, POLL_MS)
      .pipe(
        take(MAX_TICKS),
        // exhaustMap: never run two status calls at the same time
        exhaustMap(() => this.billing.getPaymentStatus(this.sessionId).pipe(catchError(() => of(null)))),
        tap((res) => {
          const p = res?.status === 1 ? res.payment : null;
          // ignore a result that belongs to some other checkout session
          if (p && (!p.sessionId || p.sessionId === this.sessionId)) this.payment.set(p);
        }),
        takeWhile(() => !this.isFinal(), true) // stop as soon as paid / failed (inclusive)
      )
      .subscribe({ complete: () => this.finish() });
  }

  private isPaid(): boolean {
    return this.payment()?.isPaid === true;
  }

  private isFailed(): boolean {
    const p = this.payment();
    if (!p) return false;
    const status = String(p.paymentStatus ?? '').toLowerCase();
    return (
      ['failed', 'cancelled', 'canceled', 'expired'].includes(status) ||
      String(p.stripeSessionStatus ?? '').toLowerCase() === 'expired'
    );
  }

  private isFinal(): boolean {
    return this.isPaid() || this.isFailed();
  }

  private finish(): void {
    if (this.isPaid()) {
      this.state.set('success');
      // backend already added the credits, we only re-read the balance
      this.store.dispatch(WalletActions.loadWallet());
    } else {
      // failed, or still not paid after 5 minutes
      this.router.navigate(['/ai/payment-failed'], {
        queryParams: { session_id: this.sessionId },
        replaceUrl: true,
      });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}