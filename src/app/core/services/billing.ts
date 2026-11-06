import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Api } from './api';
import { Login } from './login';
import { Common } from './common';
import { Toast } from './toast';
import { ChargeRequest, CheckBalanceResponse } from '../../store/wallet/wallet.model';
import { DEFAULT_AI_MODEL, DEFAULT_MAX_OUTPUT_TOKENS } from '../../store/wallet/wallet.utils';

@Injectable({ providedIn: 'root' })
export class Billing {
  private api = inject(Api);
  private login = inject(Login);
  private common = inject(Common);
  private toast = inject(Toast);

  private memberIndex(): number {
    const user = this.login.getUser();
    return Number(this.common.decryptMemberID(user?.memberIndex ?? ''));
  }

  getPlans(): Observable<any> {
    return this.api.apiGet('AiBilling/Plans');
  }

  getWallet(): Observable<any> {
    return this.api.apiGet('AiBilling/Wallet');
  }

  purchase(aiPlanIndex: number): Observable<any> {
    return this.api.apiPost('AiBilling/Purchase', { aiPlanIndex });
  }

  getInvoices(pageNumber: number, pageSize: number): Observable<any> {
    return this.api.apiGet(`AiBilling/Invoices?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  checkBalance(
    promptLength: number,
    model = DEFAULT_AI_MODEL,
    maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS
  ): Observable<CheckBalanceResponse> {
    return this.api.apiPost('AiBilling/CheckBalance', {
      memberIndex: this.memberIndex(),
      model,
      promptLength,
      maxOutputTokens,
    });
  }


  ensureCredits(promptLength: number): Observable<boolean> {
    return this.checkBalance(promptLength).pipe(
      map((res) => {
        if (res?.status === 1 && res.canSearch === false) {
          this.toast.warning(
            `This request needs about ${res.requiredCredits} credits but you have ${res.availableCredits}. Please add credits.`,
            4500
          );
          return false;
        }
        return true;
      }),
      catchError(() => of(true))
    );
  }

 
  charge(request: ChargeRequest): Observable<any> {
    const { searchType, ...payload } = request;
    return this.api.apiPost('AiBilling/Search', payload);
  }


   getPaymentStatus(sessionId: string): Observable<any> {
    return this.api.apiGet(
      `AiBilling/PaymentStatus?memberIndex=${this.memberIndex()}&sessionId=${encodeURIComponent(sessionId)}`
    );
  }
  
}