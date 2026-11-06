import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, take } from 'rxjs';
import { parseISO, isToday, isYesterday } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { Store } from '@ngrx/store';

import { Chat } from '../../../store/chat/chat.model';
import { ChatActions } from '../../../store/chat/chat.actions';
import {
  selectAllChats,
  selectHasMore,
  selectBefore,
  selectLoading,
  selectDeleteLoading,
} from '../../../store/chat/chat.selectors';
import {
  selectAvailableCredits,
  selectIsLowCredits,
  selectIsOutOfCredits,
  selectNextExpiry,
  selectRemainingPercent,
  selectWalletLoaded,
} from '../../../store/wallet/wallet.selectors';
import { Login } from '../../services/login';
import { Common } from '../../services/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink, RouterLinkActive, NgbDropdownModule, CommonModule, InfiniteScrollModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar implements OnInit {
  private store = inject(Store);
  private loginService = inject(Login);
  private commonService = inject(Common);
  private sanitizer = inject(DomSanitizer);

  readonly environment = environment;

  chats$: Observable<Chat[]> = this.store.select(selectAllChats);
  loading$: Observable<boolean> = this.store.select(selectLoading);
  deleteLoading$: Observable<boolean> = this.store.select(selectDeleteLoading);

  // Wallet
  walletLoaded = this.store.selectSignal(selectWalletLoaded);
  available = this.store.selectSignal(selectAvailableCredits);
  remainingPercent = this.store.selectSignal(selectRemainingPercent);
  nextExpiry = this.store.selectSignal(selectNextExpiry);
  isLow = this.store.selectSignal(selectIsLowCredits);
  isEmpty = this.store.selectSignal(selectIsOutOfCredits);

  @Input() isSideBarMini: boolean = false;
  @Output() handleSidebar = new EventEmitter<string>();
  @Output() handleSidebarMobile = new EventEmitter<string>();

  groupedChats = signal<{ group: string; chats: Chat[] }[]>([]);

  private hasLoaded = false;
  memberInfo: any = {};
  memberId: number = 0;

  ngOnInit(): void {
    this.memberInfo = this.loginService.getUser();
    const memberId = this.commonService.decryptMemberID(this.memberInfo.memberIndex);
    this.memberId = Number(memberId);

    if (!this.hasLoaded) {
      this.hasLoaded = true;
      this.store.dispatch(
        ChatActions.loadChats({ memberId: this.memberId, before: null, limit: 20 })
      );
    }

    this.chats$.subscribe((chats) => {
      if (chats?.length) this.groupChats(chats);
      else this.groupedChats.set([]);
    });
  }

  groupChats(chats: Chat[]): void {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const currentYear = now.getFullYear();

    const grouped: Record<string, Chat[]> = {
      Today: [],
      Yesterday: [],
      'Last 7 Days': [],
      Older: [],
    };

    for (const chat of chats) {
      try {
        const date = toZonedTime(parseISO(chat.updated_at), timezone);
        const year = date.getFullYear();
        const monthName = date.toLocaleString('default', { month: 'long' });

        if (year < currentYear) {
          grouped['Older'].push(chat);
        } else if (isToday(date)) {
          grouped['Today'].push(chat);
        } else if (isYesterday(date)) {
          grouped['Yesterday'].push(chat);
        } else if (this.isLast7Days(date)) {
          grouped['Last 7 Days'].push(chat);
        } else {
          grouped[monthName] = grouped[monthName] || [];
          grouped[monthName].push(chat);
        }
      } catch {
        grouped['Older'].push(chat);
      }
    }

    const monthGroups = Object.entries(grouped)
      .filter(([key]) => !['Today', 'Yesterday', 'Last 7 Days', 'Older'].includes(key))
      .sort((a, b) => {
        const aM = new Date(`${a[0]} 1, ${currentYear}`).getMonth();
        const bM = new Date(`${b[0]} 1, ${currentYear}`).getMonth();
        return bM - aM;
      });

    this.groupedChats.set([
      ...(grouped['Today'].length ? [{ group: 'Today', chats: grouped['Today'] }] : []),
      ...(grouped['Yesterday'].length ? [{ group: 'Yesterday', chats: grouped['Yesterday'] }] : []),
      ...(grouped['Last 7 Days'].length ? [{ group: 'Last 7 Days', chats: grouped['Last 7 Days'] }] : []),
      ...monthGroups.map(([group, chats]) => ({ group, chats })),
      ...(grouped['Older'].length ? [{ group: 'Older', chats: grouped['Older'] }] : []),
    ]);
  }

  isLast7Days(date: Date): boolean {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return date > start && !isToday(date) && !isYesterday(date);
  }

  handleChange(): void {
    this.isSideBarMini = !this.isSideBarMini;
    this.handleSidebar.emit(this.isSideBarMini.toString());
  }

  handleToggleChange(): void {
    this.handleSidebarMobile.emit('false');
  }

  onScroll(): void {
    this.store.select(selectHasMore).pipe(take(1)).subscribe((hasMore) => {
      if (!hasMore) return;
      this.store.select(selectBefore).pipe(take(1)).subscribe((before) => {
        this.store.dispatch(
          ChatActions.loadChats({ memberId: this.memberId, before, limit: 18 })
        );
      });
    });
  }

  handleDelete(e: Event, chatId: string): void {
    e.preventDefault();
    this.store.dispatch(ChatActions.deleteChat({ chatId }));
  }

  logOut(): void {
    this.loginService.logOut();
  }

  convertToHtmlFormat(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content.replace(/"/g, ''));
  }
}
