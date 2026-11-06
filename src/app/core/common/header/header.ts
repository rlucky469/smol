import { Component, HostListener, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NgbDropdownModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { Login } from '../../services/login';
import { Api } from '../../services/api';
import { environment } from '../../../../environments/environment';

import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { Common } from '../../services/common';
import { CreditMenu } from '../credit-menu/credit-menu';


export interface IMemberInfo {
    memberIndex: string;
    memberType: string,
    viewType: string,
    viewType1: string,
    name: string;
    email: string;
    emailStatus: string;
    country: string;
    plan: string,
    planIndex: string,
    expiryDate: string,
    countryIndex: number,
    userIp: string,
    platForm: string,
    Regmode: string,
    memberStatus: string,
    password: string,
    cypLink: string,
}


interface NavItem {
  id: number;
  tagId: number;
  externalLink: boolean;
  displayName: string;
  routeLink?: string | false;
  children?: NavItem[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgbDropdownModule, NgbCollapseModule, FormsModule, CreditMenu],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private loginService = inject(Login);
  private API = inject(Api);
  private common = inject(Common);

  environment: any = environment;

  // reactive template state -> signals
  isStickyHeader = signal<string>('');
  isMenuCollapsed = signal<boolean>(true);
  dropDownId = signal<number>(0);
  childrenDropDownId = signal<number>(0);
  currentUrl = signal<string>('');
  searchList = signal<any[]>([]);
  loading = signal<boolean>(false);
  data = signal<boolean>(false);
  menuType = signal<string>('default');
  nestedMenu = signal<NavItem[]>([]);
  searchQuery = signal<string>('');

  memberInfo: IMemberInfo;
  screenWidth: number = 0;
  lastScrollY = window.pageYOffset;

  apiObj: any = {};
  apiUrl: string = environment.FullSiteSearchUrl;

  private searchInputSubject = new Subject<string>();

  constructor() {
    this.memberInfo = {} as IMemberInfo;
  }

  ngOnInit(): void {
    this.memberInfo = this.loginService.getUser();
    this.apiObj = this.loginService.getApiObj();

    Object.assign(this.apiObj, {
      searchText: '-',
      recType: this.memberInfo.viewType === 'LOCAL' ? 'OP' : 'ALL',
    });

    this.apiUrl = this.loginService.getRolebaseUrl(this.apiObj.recType);

    // Header is created after the first navigation, so build the menu right away too
    this.buildMenu();
    this.router.events.subscribe(
      (res: any) => {
        if (res.url) this.buildMenu();
      },
      (err) => {}
    );

    this.screenWidth = window.innerWidth;
    this.currentUrl.set(this.router.url);
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.currentUrl.set(ev.url);
      }
    });
  }

  private buildMenu(): void {
    if (this.loginService.isLoggedIn()) {
      if (this.memberInfo.memberType === 'ACTIVE') {
        this.menuType.set('memberActive');

        if (this.memberInfo.viewType === 'LOCAL') {
          this.nestedMenu.set([
            { id: 1, tagId: 1, externalLink: false, displayName: 'Dashboard', routeLink: '/', children: [] },
            {
              id: 2, tagId: 2, externalLink: true, displayName: ' Grants ', routeLink: false, children: [
                {
                  id: 1, tagId: 2, externalLink: true, displayName: 'Funds for NGOs', routeLink: false,
                  children: [
                    { id: 0, tagId: 2, externalLink: true, displayName: 'Latest Grants', routeLink: environment.grantsDomain + 'opportunity' },
                    { id: 1, tagId: 2, externalLink: true, displayName: 'Upcoming Deadlines', routeLink: environment.grantsDomain + 'upcomingdeadlines' },
                    { id: 2, tagId: 2, externalLink: true, displayName: 'Deadline Calendar', routeLink: environment.grantsDomain + 'calendar' },
                    { id: 3, tagId: 2, externalLink: true, displayName: 'Deadline Free Grants', routeLink: environment.grantsDomain + 'deadlinefreegrants' },
                  ],
                },
                { id: 2, tagId: 2, externalLink: true, displayName: '   Grants for Organizations ', routeLink: environment.grantsDomain + 'organization-opportunities', children: [] },
                { id: 3, tagId: 2, externalLink: true, displayName: '  Grants for Businesses', routeLink: environment.grantsDomain + 'business-opportunities', children: [] },
                { id: 4, tagId: 2, externalLink: true, displayName: ' Grants for Individuals ', routeLink: environment.grantsDomain + 'individual-opportunities', children: [] },
              ],
            },
            {
              id: 3, tagId: 2, externalLink: true, displayName: 'Resources', routeLink: false, children: [
                {
                  id: 1, tagId: 3, externalLink: true, displayName: ' Sample Proposals ', routeLink: false,
                  children: [
                    { id: 0, tagId: 3, externalLink: true, displayName: ' Sample Proposals ', routeLink: environment.resourcesDomain + 'sampleproposal' },
                    { id: 1, tagId: 3, externalLink: true, displayName: ' Your Download List', routeLink: environment.resourcesDomain + 'sampleproposal/downloadlist/mydownloads' },
                  ],
                },
                { id: 2, tagId: 3, externalLink: true, displayName: 'eBooks ', routeLink: environment.resourcesDomain + 'download', children: [] },
                { id: 3, tagId: 3, externalLink: true, displayName: 'Training Videos', routeLink: environment.resourcesDomain + 'trainingvideos', children: [] },
                { id: 4, tagId: 3, externalLink: true, displayName: 'Articles', routeLink: environment.articleDomain + 'article', children: [] },
                { id: 6, tagId: 6, externalLink: true, displayName: 'Webinars', routeLink: environment.articleDomain + 'webinar', children: [] },
                { id: 5, tagId: 3, externalLink: true, displayName: 'Courses', routeLink: environment.coursesDomain + 'courses', children: [] },
              ],
            },
            { id: 7, tagId: 7, externalLink: true, displayName: ' ADVANCED SEARCH  ', routeLink: environment.grantsDomain + 'usadvancesearch', children: [] },
            { id: 4, tagId: 4, externalLink: true, displayName: '  SET YOUR GRANT ALERTS  ', routeLink: 'specific-funding-alerts-us', children: [] },
            {
              id: 5, tagId: 5, externalLink: false, displayName: ' STATES / COUNTIES  ', routeLink: false, children: [
                { id: 2, tagId: 5, externalLink: true, displayName: ' States / Counties ', routeLink: environment.grantsDomain + 'state-county-search', children: [] },
                { id: 3, tagId: 5, externalLink: true, displayName: ' Insular Areas ', routeLink: environment.grantsDomain + 'insular-area-search', children: [] },
              ],
            },
            {
  id: 6, tagId: 6, externalLink: false, displayName: 'AI Tools', routeLink: false, children: [
    { id: 1, tagId: 6, externalLink: false, displayName: 'AI Grant Fetcher', routeLink: 'ai-grant-fetcher', children: [] },
    { id: 2, tagId: 6, externalLink: false, displayName: 'AI Search', routeLink: 'ai-search', children: [] },
  ],
},
          ]);
        } else {
          this.nestedMenu.set([
            { id: 1, tagId: 1, externalLink: false, displayName: 'Dashboard', routeLink: '/', children: [] },
            {
              id: 2, tagId: 2, externalLink: true, displayName: ' Grants ', routeLink: false, children: [
                {
                  id: 1, tagId: 2, externalLink: true, displayName: 'Funds for NGOs', routeLink: false,
                  children: [
                    { id: 0, tagId: 2, externalLink: true, displayName: 'Latest Grants', routeLink: environment.grantsDomain + 'opportunity' },
                    { id: 1, tagId: 2, externalLink: true, displayName: 'Upcoming Deadlines', routeLink: environment.grantsDomain + 'upcomingdeadlines' },
                    { id: 2, tagId: 2, externalLink: true, displayName: 'Deadline Calendar', routeLink: environment.grantsDomain + 'calendar' },
                    { id: 3, tagId: 2, externalLink: true, displayName: 'Deadline Free Grants', routeLink: environment.grantsDomain + 'deadlinefreegrants' },
                    { id: 4, tagId: 2, externalLink: true, displayName: 'Grants Map', routeLink: environment.grantsDomain + 'maps' },
                    { id: 5, tagId: 2, externalLink: true, displayName: 'Advanced Search', routeLink: environment.grantsDomain + 'advancesearch' },
                  ],
                },
                { id: 2, tagId: 2, externalLink: true, displayName: ' Funds for Companies ', routeLink: environment.grantsDomain + 'companies-opportunities', children: [] },
                { id: 5, tagId: 2, externalLink: true, displayName: ' Funds for Individuals ', routeLink: environment.grantsDomain + 'individual-opportunities-list', children: [] },
              ],
            },
            {
              id: 3, tagId: 2, externalLink: true, displayName: 'Resources', routeLink: false, children: [
                {
                  id: 1, tagId: 3, externalLink: true, displayName: ' Sample Proposals ', routeLink: false,
                  children: [
                    { id: 0, tagId: 3, externalLink: true, displayName: ' Sample Proposals ', routeLink: environment.resourcesDomain + 'sampleproposal' },
                    { id: 1, tagId: 3, externalLink: true, displayName: ' Your Download List', routeLink: environment.resourcesDomain + 'sampleproposal/downloadlist/mydownloads' },
                  ],
                },
                { id: 2, tagId: 3, externalLink: true, displayName: 'eBooks ', routeLink: environment.resourcesDomain + 'download', children: [] },
                { id: 3, tagId: 3, externalLink: true, displayName: 'Training Videos', routeLink: environment.resourcesDomain + 'trainingvideos', children: [] },
                { id: 4, tagId: 3, externalLink: true, displayName: 'Articles', routeLink: environment.articleDomain + 'article', children: [] },
                { id: 6, tagId: 3, externalLink: true, displayName: 'Webinars', routeLink: environment.articleDomain + 'webinar', children: [] },
                { id: 5, tagId: 3, externalLink: true, displayName: 'Courses', routeLink: environment.coursesDomain + 'courses', children: [] },
              ],
            },
            { id: 4, tagId: 4, externalLink: true, displayName: 'Donor Search ', routeLink: environment.donorProfileDomain + 'donorsearch', children: [] },
            {
              id: 5, tagId: 5, externalLink: false, displayName: 'Alerts', routeLink: false, children: [
                { id: 1, tagId: 5, externalLink: false, displayName: 'Funding Alerts', routeLink: 'specific-funding-alerts', children: [] },
              ],
            },

            {
  id: 6, tagId: 6, externalLink: false, displayName: 'AI Tools', routeLink: false, children: [
    { id: 1, tagId: 6, externalLink: false, displayName: 'AI Grant Fetcher', routeLink: 'grant-list', children: [] },
    { id: 2, tagId: 6, externalLink: false, displayName: 'AI Search', routeLink: 'app', children: [] },
  ],
},


            
          ]);
        }
      } else {
        this.nestedMenu.set([]);
        this.menuType.set('memberExpired');
      }
    } else {
      this.menuType.set('default');
      this.nestedMenu.set([]);
    }
  }

  ngAfterViewInit() {
    this.searchInputSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((searchQuery) => this.search(searchQuery))
      )
      .subscribe(
        (res: any) => {
          this.loading.set(false);
          if (!res.result.length) {
            this.data.set(true);
          }
          this.searchList.set(res.result);
        },
        (err) => {
          this.loading.set(false);
        }
      );
  }

  onSearchInputChange() {
    this.searchInputSubject.next(this.searchQuery().trim());
  }

  search(query: string) {
    this.apiUrl = this.loginService.getRolebaseUrl(this.apiObj.recType);
    this.loading.set(true);
    this.data.set(false);
    this.apiObj.searchText = query ? this.common.removeSpecialCharacters(query).trim() : '-';
    return this.API.apiPost(this.apiUrl, this.apiObj);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth;
  }

  showDropdown(id: number) {
    if (this.screenWidth > 1199) this.dropDownId.set(id);
  }

  showChildrenDropDown(id: number) {
    if (this.screenWidth > 1199) this.childrenDropDownId.set(id);
  }

  handleSubMenuClick() {
    if (this.screenWidth <= 1199) {
      this.isMenuCollapsed.set(true);
      this.dropDownId.set(0);
      this.childrenDropDownId.set(0);
    } else {
      this.dropDownId.set(0);
      this.childrenDropDownId.set(0);
    }
  }

  mobileClick(id: number) {
    this.dropDownId.set(this.dropDownId() === id ? 0 : id);
  }

  mobileSubMenuClick(id: number, childrenId: number) {
    this.childrenDropDownId.set(this.childrenDropDownId() === childrenId ? 0 : childrenId);
  }

  toggleMenu() {
    this.isMenuCollapsed.set(!this.isMenuCollapsed());
  }

  userLogOut() {
    this.loginService.logOut();
  }

  redirectToFullSiteSearch() {
    if (this.apiObj.searchText.length) {
      this.router.navigate([`full-site-search/${this.apiObj.searchText}`]);
    }
  }

  @HostListener('window:scroll', ['$event'])
  updateScrollDirection(event?: Event) {
    const scrollY = window.pageYOffset;
    const direction = scrollY > this.lastScrollY ? 'down' : 'up';
    if (direction !== this.isStickyHeader() && (scrollY - this.lastScrollY > 20 || scrollY - this.lastScrollY < -10)) {
      this.isStickyHeader.set(direction);
    } else if (scrollY < 20) {
      this.isStickyHeader.set('');
    }
    this.lastScrollY = scrollY > 0 ? scrollY : 0;
  }
}
