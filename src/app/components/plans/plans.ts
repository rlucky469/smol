import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { BreadCrumbs } from '../../core/common/bread-crumbs/bread-crumbs';
import { Toast } from '../../core/services/toast';
import { environment } from '../../../environments/environment';
import { PlansActions } from '../../store/plans/plans.actions';
import { AiPlan } from '../../store/plans/plans.model';
import { selectBestValuePlanId, selectPlans, selectPlansLoading } from '../../store/plans/plans.selectors';
import {
  selectAvailableCredits,
  selectIsOutOfCredits,
  selectNextExpiry,
  selectUsedCredits,
  selectWalletLoaded,
} from '../../store/wallet/wallet.selectors';

import { Billing } from '../../core/services/billing';
import { WalletActions } from '../../store/wallet/wallet.actions';

interface CreditCost {
  icon: string;
  title: string;
  description: string;
  rate: string;
}

@Component({
  selector: 'app-plans',
  imports: [BreadCrumbs, RouterLink, CurrencyPipe, DecimalPipe, DatePipe],
  templateUrl: './plans.html',
  styleUrl: './plans.scss',
})
export class Plans implements OnInit {
  private store = inject(Store);
  private toast = inject(Toast);

  readonly environment = environment;

   private billing = inject(Billing);
    buyingId = signal<number | null>(null); // plan being purchased (button loading state)

  plans = this.store.selectSignal(selectPlans);
  loading = this.store.selectSignal(selectPlansLoading);
  bestValueId = this.store.selectSignal(selectBestValuePlanId);

  walletLoaded = this.store.selectSignal(selectWalletLoaded);
  available = this.store.selectSignal(selectAvailableCredits);
  used = this.store.selectSignal(selectUsedCredits);
  nextExpiry = this.store.selectSignal(selectNextExpiry);
  isEmpty = this.store.selectSignal(selectIsOutOfCredits);

  openFaq = signal(0);

  // TODO: update rates once per-action pricing is final (billing is token based)
  readonly creditCosts: CreditCost[] = [
    { icon: 'far fa-comment-dots', title: 'Chat message', description: 'Ask the AI assistant about grants, eligibility and donors.', rate: 'Per message' },
    { icon: 'fas fa-search', title: 'AI grant search', description: 'Search thousands of grants with AI match scoring.', rate: 'Per search' },
    { icon: 'fas fa-magic', title: 'Profile analysis', description: 'AI reads your website or PDF and scores matching grants.', rate: 'Per analysis' },
  ];

  readonly faqs = [
    { q: 'How long are my credits valid?', a: 'Credits stay valid for the number of days shown on the plan, starting from the purchase date. Your next expiry date is shown in the header credit menu.' },
    { q: 'How are credits deducted?', a: 'Each AI action (chat message, AI grant search, profile analysis) deducts credits based on the AI usage of that request. Browsing, filters and pagination are free.' },
    { q: 'What happens when I run out of credits?', a: 'You can still browse grants and read your chat history. Buy a plan to continue using AI features.' },
    { q: 'Where can I find my invoices?', a: 'All purchases are listed on the Invoices page, where each invoice can be viewed and downloaded as PDF.' },
  ];

  ngOnInit(): void {
    document.title = 'Plans - fundsforNGOs Premium';
    window.scrollTo(0, 0);
    this.store.dispatch(PlansActions.loadPlans());
    this.store.dispatch(WalletActions.loadWallet()); // fresh balance, e.g. after coming back from Stripe
  }

  // Back button from Stripe can restore this page from cache -> reset the loading state
  @HostListener('window:pageshow')
  onPageShow(): void {
    this.buyingId.set(null);
  }

 
  totalCredits(plan: AiPlan): number {
    return plan.credits + plan.bonusCredits;
  }

  pricePerThousand(plan: AiPlan): number {
    const total = this.totalCredits(plan);
    return total > 0 ? (plan.priceUSD / total) * 1000 : 0;
  }

  toggleFaq(index: number): void {
    this.openFaq.update((open) => (open === index ? -1 : index));
  }

  // TODO: wire Razorpay checkout once the order/verify API is ready
   buy(plan: AiPlan): void {
    if (this.buyingId() !== null) return;
    this.buyingId.set(plan.aiPlanIndex);

    this.billing.purchase(plan.aiPlanIndex).subscribe({
      next: (res) => {
        const url: string | undefined = res?.purchase?.checkoutUrl;
        if (res?.status === 1 && url?.startsWith('https://')) {
          window.location.href = url; 
        } else {
          this.buyingId.set(null);
          this.toast.danger(res?.message || 'Could not start checkout. Please try again.', 4000);
        }
      },
      error: () => {
        this.buyingId.set(null);
        this.toast.danger('Could not start checkout. Please try again.', 4000);
      },
    });
  }

}
