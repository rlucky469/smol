import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  Signal,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';

import * as A from '../../../store/conversation/conversation.actions';
import {
  selectConversationLoading,
  selectMessages,
  selectIsConversationLoading,
  selectStreamingMessage,
  selectHasMore,
} from '../../../store/conversation/conversation.selectors';
import { Message } from '../../../store/conversation/conversation.models';
import { WalletActions } from '../../../store/wallet/wallet.actions';
import { selectHasCredits } from '../../../store/wallet/wallet.selectors';
import { chargeActions } from '../../../store/wallet/wallet.utils';
import { ConversationService } from '../../services/conversation';
import { Login } from '../../services/login';
import { Common } from '../../services/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NoCredits } from '../no-credits/no-credits';
import { environment } from '../../../../environments/environment';
import { Billing } from '../../services/billing';

interface MsgWithHtml extends Message {
  htmlContent: SafeHtml;
}

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule, NoCredits],
  templateUrl: './conversation.html',
  styleUrl: './conversation.scss',
})
export class Conversation implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;


  
  useStreaming = false;

  messages$: Observable<Message[]>;
  isConversationLoading$: Observable<boolean>;
  loading$: Observable<boolean>;
  streamingMessage$: Observable<string>;
  hasMore$: Observable<boolean>;
  hasCredits: Signal<boolean>;

  message = '';
  chatId: string | null = null;
  messagesWithHtml: MsgWithHtml[] = [];
  streamingHtml: SafeHtml = '';

  memberId = 0;
  memberInfo: any = {};
  externalUserId = '';

  editingTitle = false;
  titleInput = '';

  private abortController: AbortController | null = null;
  private destroy$ = new Subject<void>();
 
  private checking = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private sanitizer: DomSanitizer,
    private svc: ConversationService,
    private loginService: Login,
    private commonService: Common,
    private cdr: ChangeDetectorRef,
    
    private billing: Billing
    
  ) {
    this.messages$ = this.store.select(selectMessages);
    this.loading$ = this.store.select(selectConversationLoading);
    this.isConversationLoading$ = this.store.select(selectIsConversationLoading);
    this.streamingMessage$ = this.store.select(selectStreamingMessage);
    this.hasMore$ = this.store.select(selectHasMore);
    this.hasCredits = this.store.selectSignal(selectHasCredits);


    this.memberInfo = this.loginService.getUser();
    const decrypted = this.commonService.decryptMemberID(this.memberInfo.memberIndex);
    this.memberId = Number(decrypted);
    this.externalUserId = String(this.memberId);


    const showTemp = localStorage.getItem('_SHOW_TEMP_');
    this.chatId = this.route.snapshot.paramMap.get('id');

    if (!showTemp) {
      if (this.chatId) {
        this.store.dispatch(A.loadConversation({ sessionId: this.chatId }));
      } else {
        this.store.dispatch(A.clearConversation());
      }
    }

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const id = this.router.url.split('/')[2];
        const showTemp = localStorage.getItem('_SHOW_TEMP_');

        if (id && !showTemp) {
          this.chatId = id;
          this.store.dispatch(A.loadConversation({ sessionId: id }));
        }

        if (!id && !showTemp) {
          this.chatId = null;
          this.store.dispatch(A.clearConversation());
        }

        if (showTemp) {
          this.chatId = id;
          localStorage.removeItem('_SHOW_TEMP_');
        }
      });
  }

  ngOnInit(): void {
    this.messages$.pipe(takeUntil(this.destroy$)).subscribe((messages) => {
      this.messagesWithHtml = messages.map((msg: any) => ({
        ...msg,
        htmlContent: this.toHtml(msg.content, msg.sources),
      }));
      this.cdr.detectChanges();
      setTimeout(() => this.scrollToBottom(), 0);
    });

    this.streamingMessage$.pipe(takeUntil(this.destroy$)).subscribe((text) => {
      this.streamingHtml = text ? this.toHtml(text) : '';
      if (text) setTimeout(() => this.scrollToBottom(), 0);
    });
  }


  ngAfterViewInit(): void {
    localStorage.removeItem('_SHOW_TEMP_');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.abortController?.abort();
  }

   

  // Chat(): void {
  //   const text = this.message.trim();
  //   if (!text || !this.hasCredits()) return;
  //   this.message = '';

  //   const userMsg: Message = {
  //     id: crypto.randomUUID(),
  //     role: 'user',
  //     content: text,
  //     sources: null,
  //     created_at: new Date().toISOString(),
  //   };
  //   this.store.dispatch(A.addOptimisticUserMessage({ msg: userMsg }));

  //   if (!this.chatId) {
  //     localStorage.setItem('_SHOW_TEMP_', 'true');
  //     this.store.dispatch(
  //       A.createConversation({ externalUserId: this.externalUserId, message: text })
  //     );
  //     return;
  //   }

  //   if (this.useStreaming) {
  //     this.sendStreaming(this.chatId, text);
  //   } else {
  //     this.store.dispatch(
  //       A.sendMessage({
  //         externalUserId: this.externalUserId,
  //         sessionId: this.chatId,
  //         message: text,
  //       })
  //     );
  //   }
  // }


   Chat(): void {
    const text = this.message.trim();
    if (!text || !this.hasCredits() || this.checking) return;

    this.checking = true;
    this.billing.ensureCredits(text.length).subscribe((ok) => {
      this.checking = false;
      if (ok) this.sendChat(text); // if not ok, message stays in the textbox
    });
  }

   private sendChat(text: string): void {
    this.message = '';

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      sources: null,
      created_at: new Date().toISOString(),
    };
    this.store.dispatch(A.addOptimisticUserMessage({ msg: userMsg }));

    if (!this.chatId) {
      localStorage.setItem('_SHOW_TEMP_', 'true');
      this.store.dispatch(A.createConversation({ externalUserId: this.externalUserId, message: text }));
      return;
    }

    if (this.useStreaming) {
      this.sendStreaming(this.chatId, text);
    } else {
      this.store.dispatch(
        A.sendMessage({ externalUserId: this.externalUserId, sessionId: this.chatId, message: text })
      );
    }
  }

  

  // regenerate(): void {
  //   if (!this.chatId || !this.hasCredits()) return;
  //   const sessionId = this.chatId;
  //   const lastUser = [...this.messagesWithHtml].reverse().find((m) => m.role === 'user')?.content ?? '';

  //   this.billing.ensureCredits(lastUser.length).subscribe((ok) => {
  //     if (ok) this.store.dispatch(A.regenerateResponse({ sessionId }));
  //   });
  // }




  private async sendStreaming(sessionId: string, message: string): Promise<void> {

    this.abortController?.abort();
    this.abortController = new AbortController();

    const url = this.svc.getStreamUrl();
    const body = this.svc.getStreamBody(this.externalUserId, sessionId, message);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
          'X-API-Key': environment.chatApiKey,
          'X-External-User-Id': this.externalUserId,
        },
        body: JSON.stringify(body),
        signal: this.abortController.signal,
      });


      if (!res.ok || !res.body) {
        this.store.dispatch(A.sendMessageFailure({ error: 'Stream failed' }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const chunk = line.slice(6);
            if (!chunk) continue;
            this.store.dispatch(A.streamChunk({ chunk }));
            fullText += chunk;
          }
        }
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullText,
        sources: null,
        created_at: new Date().toISOString(),
      };
      this.store.dispatch(A.streamDone({ assistantMsg }));

      // Stream does not return token usage yet, so usage goes as zero
      chargeActions('Chat', message, null, assistantMsg.id, fullText).forEach((a) => this.store.dispatch(a));

    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        this.store.dispatch(A.sendMessageFailure({ error: err }));
      }
    }
  }

  regenerate(): void {
    if (!this.chatId || !this.hasCredits()) return;
    this.store.dispatch(A.regenerateResponse({ sessionId: this.chatId }));
  }

  giveFeedback(msg: MsgWithHtml, rating: 'up' | 'down'): void {
    if (!this.chatId || msg.feedbackRating) return;
    this.store.dispatch(
      A.submitFeedback({ sessionId: this.chatId, messageId: msg.id, rating })
    );
  }

  deleteMessage(messageId: string): void {
    if (!this.chatId) return;
    this.store.dispatch(A.deleteMessage({ sessionId: this.chatId, messageId }));
  }

  startRename(): void { this.editingTitle = true; }

  saveRename(): void {
    if (!this.chatId || !this.titleInput.trim()) { this.editingTitle = false; return; }
    this.store.dispatch(A.renameSession({ sessionId: this.chatId, title: this.titleInput.trim() }));
    this.editingTitle = false;
  }

  deleteSession(): void {
    if (!this.chatId) return;
    if (confirm('Delete this chat?')) {
      this.store.dispatch(A.deleteSession({ sessionId: this.chatId }));
    }
  }

  exportChat(format: 'json' | 'txt' = 'json'): void {
    if (!this.chatId) return;
    this.store.dispatch(A.exportSession({ sessionId: this.chatId, format }));
  }

  loadMore(): void {
    if (!this.chatId) return;
    this.store.dispatch(A.loadMoreMessages({ sessionId: this.chatId }));
  }

  resizeTextarea(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.overflowY = 'hidden';
    const max = 24 * 10;
    el.style.height = el.scrollHeight <= max ? `${el.scrollHeight}px` : `${max}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch { }
  }

 private readonly OP_URL = 'https://grants.fundsforngospremium.com/opportunity/op/';

  toHtml(content: string, sources: any[] = []): SafeHtml {
    const fixed = content
      .replace(/^\*\*Title:\*\*\s*(.+)$/gm, '# $1')
      .replace(/^\*\*([A-Z\s]+)\*\*$/gm, '## $1');

    let html = marked.parse(fixed) as string;
    if (sources?.length) html = this.linkSources(html, sources);

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Words used to compare a heading with a source title (generic words ignored)
  private titleTokens(text: string): Set<string> {
    const stop = new Set([
      'the', 'an', 'of', 'for', 'and', 'in', 'to', 'call', 'calls',
      'application', 'applications', 'open', 'now', 'new', 'grant', 'grants',
    ]);
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1 && !stop.has(w))
    );
  }

  // Share of the heading's words that are found in the source title (0 to 1)
  private matchScore(heading: string, title: string): number {
    const h = this.titleTokens(heading);
    const t = this.titleTokens(title);
    if (!h.size) return 0;
    let hit = 0;
    h.forEach((w) => t.has(w) && hit++);
    return hit / h.size;
  }

  private linkSources(html: string, sources: any[]): string {
    const list = sources
      .filter((s) => s?.metadata?.friendly_url)
      .map((s) => ({ title: String(s.title ?? ''), url: this.OP_URL + s.metadata.friendly_url }));
    if (!list.length) return html;

    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Grant titles: h2/h3, or the bold title of a TOP-LEVEL list item (not nested bullets like "Deadline:")
    const nodes = Array.from(
      doc.body.querySelectorAll<HTMLElement>(
        'h2, h3, li > strong:first-child, li > p:first-child > strong:first-child'
      )
    ).filter((el) => {
      if (!el.textContent?.trim()) return false;
      if (el.tagName === 'STRONG') {
        const li = el.closest('li');
        if (li?.parentElement?.closest('li')) return false; // nested list item
      }
      return true;
    });

    const used = new Set<number>();
    const assigned = new Map<HTMLElement, number>();

    // Step 1: match by title words
    for (const el of nodes) {
      let best = -1;
      let bestScore = 0;
      list.forEach((s, i) => {
        if (used.has(i)) return;
        const score = this.matchScore(el.textContent ?? '', s.title);
        if (score > bestScore) { bestScore = score; best = i; }
      });
      if (best >= 0 && bestScore >= 0.5) {
        assigned.set(el, best);
        used.add(best);
      }
    }

    // Step 2: the rest get the remaining sources in order
    for (const el of nodes) {
      if (assigned.has(el)) continue;
      const next = list.findIndex((_, i) => !used.has(i));
      if (next < 0) break;
      assigned.set(el, next);
      used.add(next);
    }

    assigned.forEach((i, el) => {
      const a = doc.createElement('a');
      a.href = list[i].url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      while (el.firstChild) a.appendChild(el.firstChild);
      el.appendChild(a);
    });

    return doc.body.innerHTML;
  }


  isLastAssistantMsg(msg: MsgWithHtml): boolean {
    const list = this.messagesWithHtml.filter((m) => m.role === 'assistant');
    return list.length > 0 && list[list.length - 1].id === msg.id;
  }

    sourceLinks(msg: MsgWithHtml): { title: string; url: string }[] {
    return ((msg.sources ?? []) as any[])
      .filter((s) => s?.metadata?.friendly_url)
      .map((s) => ({ title: s.title, url: this.OP_URL + s.metadata.friendly_url }));
  }

  trackById(_: number, msg: Message): string {
    return msg.id;
  }
}
