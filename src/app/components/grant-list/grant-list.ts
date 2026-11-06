import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ActiveProfile } from '../active-profile/active-profile';
import { BreadCrumbs } from '../../core/common/bread-crumbs/bread-crumbs';
import { NoCredits } from '../../core/common/no-credits/no-credits';
import { Login } from '../../core/services/login';
import { Toast } from '../../core/services/toast';
import { GrantsActions } from '../../store/grants/grants.actions';
import {
  AMOUNT_OPTIONS,
  DEFAULT_GRANT_FILTERS,
  GrantFilters,
  IGrant,
  MATCH_OPTIONS,
  SORT_OPTIONS,
  TYPE_OPTIONS,
} from '../../store/grants/grants.model';
import {
  ActiveFilterChip,
  selectActiveGrantFilters,
  selectGrantFilters,
  selectGrantPage,
  selectGrantPageSize,
  selectGrantProfile,
  selectGrantStats,
  selectGrants,
  selectGrantsLoading,
  selectInitialCountryIds,
  selectInitialIssueIds,
} from '../../store/grants/grants.selectors';
import { selectHasCredits } from '../../store/wallet/wallet.selectors';
import { Billing } from '../../core/services/billing';

export type { IGrant } from '../../store/grants/grants.model';

@Component({
  selector: 'app-grant-list',
  standalone: true,
  imports: [FormsModule, NgbDropdownModule, NgbPaginationModule, ActiveProfile, BreadCrumbs, NoCredits],
  templateUrl: './grant-list.html',
  styleUrl: './grant-list.scss',
})
export class GrantList implements OnInit {
  private store = inject(Store);
  private login = inject(Login);
  private toast = inject(Toast);
  private billing = inject(Billing);

  readonly sortOptions = SORT_OPTIONS;
  readonly amountOptions = AMOUNT_OPTIONS;
  readonly matchOptions = MATCH_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;

  searchInput = signal('');

  filters = this.store.selectSignal(selectGrantFilters);
  activeFilters = this.store.selectSignal(selectActiveGrantFilters);
  grants = this.store.selectSignal(selectGrants);
  stats = this.store.selectSignal(selectGrantStats);
  isLoading = this.store.selectSignal(selectGrantsLoading);
  currentPage = this.store.selectSignal(selectGrantPage);
  pageSize = this.store.selectSignal(selectGrantPageSize);
  profile = this.store.selectSignal(selectGrantProfile);
  initialCountryIds = this.store.selectSignal(selectInitialCountryIds);
  initialIssueIds = this.store.selectSignal(selectInitialIssueIds);
  hasCredits = this.store.selectSignal(selectHasCredits);

  ngOnInit() {
    document.title = 'Discover Grants - fundsforNGOs Premium';
    window.scrollTo(0, 0);

    const profileId = this.login.getApiObj().memberId;
    if (!profileId) return;

    this.searchInput.set(this.filters().searchText);
    this.store.dispatch(GrantsActions.loadProfile({ profileId }));
  }

  // Search button / Enter is the only billed action on this page
 onSearch() {
    const text = this.searchInput().trim();

    if (!text) {
      this.store.dispatch(GrantsActions.searchGrants({ searchText: text })); // free
      return;
    }
    if (!this.hasCredits()) {
      this.toast.warning('You are out of credits. Please add credits to run an AI search.', 4000);
      return;
    }
    this.billing.ensureCredits(text.length).subscribe((ok) => {
      if (ok) this.store.dispatch(GrantsActions.searchGrants({ searchText: text }));
    });
  }
  
  setFilter(key: keyof GrantFilters, value: string) {
    if (this.filters()[key] === value) return;
    this.store.dispatch(GrantsActions.setFilters({ filters: { [key]: value } }));
  }

  onPageChange(page: number) {
    if (page === this.currentPage()) return;
    this.store.dispatch(GrantsActions.setPage({ page }));
  }

  removeFilter(chip: ActiveFilterChip) {
    if (chip.key === 'searchText') this.searchInput.set('');
    this.store.dispatch(GrantsActions.setFilters({ filters: { [chip.key]: DEFAULT_GRANT_FILTERS[chip.key] } }));
  }

  clearAllFilters() {
    this.searchInput.set('');
    this.store.dispatch(GrantsActions.clearFilters());
  }

  onProfileSave(data: { name: string; description: string; countryIds: number[]; issueIds: number[] }) {
    this.store.dispatch(GrantsActions.updateProfile({ update: data }));
  }

  viewDetails(grant: IGrant) {
    const link = document.createElement('a');
    link.href = 'https://grants.fundsforngospremium.com/opportunity/op/' + grant.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  }

  saveGrant(grant: IGrant) {
    console.log('Saved grant', grant);
  }
}
