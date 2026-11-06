import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { BreadCrumbs } from '../../core/common/bread-crumbs/bread-crumbs';
import { NoCredits } from '../../core/common/no-credits/no-credits';
import { Api } from '../../core/services/api';
import { Login } from '../../core/services/login';
import { environment } from '../../../environments/environment';
import { WalletActions } from '../../store/wallet/wallet.actions';
import { selectHasCredits } from '../../store/wallet/wallet.selectors';
import { GrantsActions } from '../../store/grants/grants.actions';
import { Billing } from '../../core/services/billing';
import {chargeActions} from '../../store/wallet/wallet.utils';

interface ProcessStep {
  id: number;
  label: string;
  status: 'done' | 'active' | 'waiting' | 'error';
}

@Component({
  selector: 'app-analyze-profile',
  imports: [FormsModule, BreadCrumbs, NoCredits],
  templateUrl: './analyze-profile.html',
  styleUrl: './analyze-profile.scss',
})
export class AnalyzeProfile implements OnDestroy {
  private router = inject(Router);
  private API = inject(Api);
  private login = inject(Login);
  private store = inject(Store);
  private billing = inject(Billing);

  activeTab = signal<'url' | 'pdf'>('url');
  websiteUrl = signal('');
  selectedFile = signal<File | null>(null);

  view = signal<'form' | 'loading'>('form');

  progress = signal(0);
  errorMessage = signal<string | null>(null);

  hasCredits = this.store.selectSignal(selectHasCredits);

  steps = signal<ProcessStep[]>([
    { id: 1, label: 'Scanning 10,000+ global grants', status: 'waiting' },
    { id: 2, label: 'Cross-referencing eligibility criteria', status: 'waiting' },
    { id: 3, label: 'Scoring mission alignment', status: 'waiting' },
    { id: 4, label: 'Ranking by estimated success chance', status: 'waiting' },
  ]);

  private streamSub: Subscription | null = null;
  private lastProcessedLength = 0;
  private charged = false;

  setTab(tab: 'url' | 'pdf') {
    this.activeTab.set(tab);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

   findGrants() {
    if (!this.hasCredits()) return;
    if (this.activeTab() === 'url' && !this.websiteUrl().trim()) return;
    if (this.activeTab() === 'pdf' && !this.selectedFile()) return;

    // Real input is the website/PDF content, so URL length alone is too small an estimate.
    // 4000 is a rough guess, tune it after checking real usage numbers.
    this.billing.ensureCredits(4000).subscribe((ok) => {
      if (!ok) return;
      this.view.set('loading');
      this.resetLoader();
      this.runAnalyzeStream();
    });
  }

  private resetLoader() {
    this.progress.set(0);
    this.errorMessage.set(null);
    this.lastProcessedLength = 0;
    this.charged = false;
    this.steps.set([
      { id: 1, label: 'Scanning 10,000+ global grants', status: 'active' },
      { id: 2, label: 'Cross-referencing eligibility criteria', status: 'waiting' },
      { id: 3, label: 'Scoring mission alignment', status: 'waiting' },
      { id: 4, label: 'Ranking by estimated success chance', status: 'waiting' },
    ]);
  }

  private buildFormData(): FormData {
    const memberId = this.login.getApiObj().memberId;
    const formData = new FormData();
    const isUrl = this.activeTab() === 'url';

    formData.append('memberId', String(memberId));
    formData.append(
      'options',
      JSON.stringify({ useUrls: isUrl, useText: false, useFiles: !isUrl })
    );

    if (isUrl) {
      formData.append('urls', this.websiteUrl().trim());
    } else if (this.selectedFile()) {
      formData.append('files', this.selectedFile()!);
    }

    return formData;
  }

  private runAnalyzeStream() {
    const formData = this.buildFormData();

    this.streamSub = this.API.apiPostStream(
      environment.nodeApiUrl + `/ngo-analyzer/analyze-stream`,
      formData
    ).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.DownloadProgress) {
          this.processPartialText(event.partialText || '');
        } else if (event.type === HttpEventType.Response) {
          this.processPartialText(event.body || '');
        }
      },
      error: (err) => {
        this.onStreamError(err?.message || 'Something went wrong');
      },
    });
  }

  private processPartialText(fullText: string) {
    const newChunk = fullText.slice(this.lastProcessedLength);
    this.lastProcessedLength = fullText.length;

    const parts = newChunk.split('\n\n').filter((p) => p.trim().startsWith('data:'));
    for (const part of parts) {
      try {
        const jsonStr = part.replace(/^data:\s*/, '');
        const evt = JSON.parse(jsonStr);
        this.handleStreamEvent(evt);
      } catch {
        // partial chunk, wait for the rest
      }
    }
  }

  private handleStreamEvent(evt: { step: number; status: 'start' | 'done' | 'error'; message: string; data?: any }) {
    if (evt.step === 0 || evt.status === 'error') {
      this.onStreamError(evt.message);
      return;
    }

    if (evt.status === 'start') {
      this.setStepActive(evt.step);
    }

    if (evt.status === 'done') {
      this.completeStep(evt.step);
      this.progress.set(evt.step * 25);
    }

    if (evt.step === 4 && evt.status === 'done' && evt.data?.ngoProfileId) {
      this.progress.set(100);
      this.chargeAnalysis(evt.data);

      // New profile → drop old grant results/filters
      this.store.dispatch(GrantsActions.reset());
      this.router.navigate(['/grant-list']);
    }
  }

  // Bills the profile analysis once, using token usage from the final event
  private chargeAnalysis(data: any) {
    if (this.charged) return;
    this.charged = true;

     const prompt = this.activeTab() === 'url' ? this.websiteUrl().trim() : this.selectedFile()?.name ?? 'PDF upload';
    const key = data.ngoProfileId ? `analyze-${data.ngoProfileId}-${Date.now()}` : undefined;
    chargeActions('ProfileAnalysis', prompt, data, key).forEach((a) => this.store.dispatch(a));
  }

  private setStepActive(id: number) {
    this.steps.update((list) =>
      list.map((s) => (s.id === id && s.status === 'waiting' ? { ...s, status: 'active' as const } : s))
    );
  }

  private completeStep(id: number) {
    this.steps.update((list) =>
      list.map((s) => {
        if (s.id === id) return { ...s, status: 'done' as const };
        if (s.id === id + 1 && s.status === 'waiting') return { ...s, status: 'active' as const };
        return s;
      })
    );
  }

  private onStreamError(message: string) {
    this.errorMessage.set(message);
    this.steps.update((list) =>
      list.map((s) => (s.status === 'active' ? { ...s, status: 'error' as const } : s))
    );
  }

  statusLabel(status: ProcessStep['status']): string {
    if (status === 'done') return 'Done';
    if (status === 'active') return 'Analyzing...';
    if (status === 'error') return 'Failed';
    return 'Waiting';
  }

  ngOnDestroy() {
    this.streamSub?.unsubscribe();
  }
}
