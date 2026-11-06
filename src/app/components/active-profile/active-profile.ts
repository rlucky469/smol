import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/services/api';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

export interface IActiveProfile {
  name: string;
  description: string;
}

export interface IOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-active-profile',
  standalone: true,
  imports: [FormsModule, NgbTooltipModule],
  templateUrl: './active-profile.html',
  styleUrl: './active-profile.scss',
})
export class ActiveProfile implements OnInit, OnChanges {
  private API = inject(Api);

  @Input() profile: IActiveProfile = { name: '', description: '' };
  @Input() initialCountryIds: number[] = [];
  @Input() initialIssueIds: number[] = [];
  @Input() profileId: string | null = null;

  @Output() save = new EventEmitter<{
    name: string;
    description: string;
    countryIds: number[];
    issueIds: number[];
  }>();

  countryList = signal<IOption[]>([]);
  issuesList = signal<IOption[]>([]);

  selectedCountryIds = signal<number[]>([]);
  selectedIssueIds = signal<number[]>([]);

  private originalCountryIds = signal<number[]>([]);
  private originalIssueIds = signal<number[]>([]);

  countrySearch = signal('');
  issueSearch = signal('');

  showGeographic = signal(true);
  showImpact = signal(true);

  isEditing = signal(false);
  editName = signal('');
  editDescription = signal('');

  visibleCountries = computed(() =>
    this.countryList().filter((c) => c.name.toLowerCase().includes(this.countrySearch().toLowerCase()))
  );

  visibleIssues = computed(() =>
    this.issuesList().filter((i) => i.name.toLowerCase().includes(this.issueSearch().toLowerCase()))
  );

  selectedCountries = computed(() =>
    this.countryList().filter((c) => this.selectedCountryIds().includes(c.id))
  );

  selectedIssues = computed(() =>
    this.issuesList().filter((i) => this.selectedIssueIds().includes(i.id))
  );

  hasChanges = computed(() => {
    const nameChanged = this.isEditing() && this.editName() !== this.profile.name;
    const descChanged = this.isEditing() && this.editDescription() !== this.profile.description;
  
    const countryChanged =
      JSON.stringify([...this.selectedCountryIds()].sort()) !==
      JSON.stringify([...this.originalCountryIds()].sort());
    const issueChanged =
      JSON.stringify([...this.selectedIssueIds()].sort()) !==
      JSON.stringify([...this.originalIssueIds()].sort());
    return nameChanged || descChanged || countryChanged || issueChanged;
  });

  ngOnInit() {
    this.getCountries();
    this.getIssues();
    this.applyInitialSelection();
    this.syncEditFields();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialCountryIds'] || changes['initialIssueIds']) {
      this.applyInitialSelection();
    }

 
    if (changes['profile'] && !this.isEditing()) {
      this.syncEditFields();
    }
  }

  private syncEditFields() {
    this.editName.set(this.profile.name);
    this.editDescription.set(this.profile.description);
  
  }

  private applyInitialSelection() {
    this.selectedCountryIds.set([...this.initialCountryIds]);
    this.selectedIssueIds.set([...this.initialIssueIds]);
    this.originalCountryIds.set([...this.initialCountryIds]);
    this.originalIssueIds.set([...this.initialIssueIds]);
  }

  getIssues() {
    this.API.getAll('Country/GetIssues').subscribe((res: any) => {
      if (res.status === 1) {
        this.issuesList.set(res.issues.map((val: any) => ({ id: val.id, name: val.issue })));
      }
    });
  }

  getCountries() {
    this.API.getAll('country/getcountries').subscribe((res: any) => {
      if (res.status === 1) {
        this.countryList.set(res.countries.map((val: any) => ({ id: val.countryid, name: val.countryname })));
      }
    });
  }

  toggleCountry(id: number) {
    this.selectedCountryIds.update((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  toggleIssue(id: number) {
    this.selectedIssueIds.update((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  onEdit() {
    this.isEditing.set(true);
    this.syncEditFields(); 
  }

  onSaveProfile() {
    this.save.emit({
      name: this.editName(),
      description: this.editDescription(),
      countryIds: this.selectedCountryIds(),
      issueIds: this.selectedIssueIds(),
    });
    this.originalCountryIds.set(this.selectedCountryIds());
    this.originalIssueIds.set(this.selectedIssueIds());
    this.isEditing.set(false);
  }
}