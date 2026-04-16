import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { Category, Genre, Paginated, TranslatableName } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { LocalizedNamePipe } from '../pipes/localized-name.pipe';

interface WeightRow { id: number; name: string; weight: number; }

const EMPTY_NAME = (): TranslatableName => ({ en: '', es: '', fr: '', pt: '', it: '' });

@Component({
  selector: 'app-admin-genres',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, DialogComponent, LocalizedNamePipe],
  templateUrl: './admin-genres.component.html',
  styleUrl: './admin-genres.component.css',
})
export class AdminGenresComponent implements OnInit {
  private api = inject(AdminApiService);
  private t   = inject(TranslocoService);

  readonly locales = [
    { code: 'en', label: 'English (EN) *' },
    { code: 'es', label: 'Español (ES)' },
    { code: 'fr', label: 'Français (FR)' },
    { code: 'pt', label: 'Português (PT)' },
    { code: 'it', label: 'Italiano (IT)' },
  ];

  page    = signal<Paginated<Genre> | null>(null);
  perPage = signal(25);
  sortBy  = signal('id');
  sortDir = signal<'asc' | 'desc'>('asc');
  filterSearch = signal('');

  formDialogOpen  = signal(false);
  formDialogTitle = signal('');
  editingId       = signal<number | null>(null);
  formName        = signal<TranslatableName>(EMPTY_NAME());

  weightsDialogOpen  = signal(false);
  weightsDialogTitle = signal('');
  weightGenreId      = signal<number | null>(null);
  allCategories      = signal<Category[]>([]);
  assignedRows       = signal<WeightRow[]>([]);
  addingCategoryId   = signal<number>(0);

  confirmDialogOpen     = signal(false);
  confirmDialogTitle    = signal('');
  confirmDialogSubtitle = signal('');
  private pendingAction = signal<(() => void) | null>(null);

  availableCategories = computed(() => {
    const assignedIds = new Set(this.assignedRows().map(r => r.id));
    return this.allCategories().filter(c => !assignedIds.has(c.id));
  });

  ngOnInit(): void {
    this.load();
    this.api.getAllCategories().subscribe(c => this.allCategories.set(c));
  }

  load(p = 1): void {
    const params: Record<string, string> = {
      page: String(p),
      per_page: String(this.perPage()),
      sort_by: this.sortBy(),
      sort_dir: this.sortDir(),
    };
    if (this.filterSearch()) params['search'] = this.filterSearch();
    this.api.getGenres(params).subscribe(data => this.page.set(data));
  }

  setSort(col: string): void {
    if (this.sortBy() === col) this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    else { this.sortBy.set(col); this.sortDir.set('asc'); }
    this.load();
  }

  sortIcon(col: string): string {
    if (this.sortBy() !== col) return '';
    return this.sortDir() === 'asc' ? ' ▲' : ' ▼';
  }

  setPerPage(n: number): void { this.perPage.set(n); this.load(); }

  updateFormName(locale: string, value: string): void {
    this.formName.update(n => ({ ...n, [locale]: value }));
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formName.set(EMPTY_NAME());
    this.formDialogTitle.set(this.t.translate('admin.genres.new_title'));
    this.formDialogOpen.set(true);
  }

  openEdit(item: Genre): void {
    this.editingId.set(item.id);
    this.formName.set({ ...EMPTY_NAME(), ...item.name });
    this.formDialogTitle.set(this.t.translate('admin.genres.edit_title', { name: item.name[this.t.getActiveLang()] || item.name['en'] }));
    this.formDialogOpen.set(true);
  }

  save(): void {
    if (!this.formName()['en']?.trim()) return;
    const id = this.editingId();
    const req = id
      ? this.api.updateGenre(id, { name: this.formName() })
      : this.api.createGenre({ name: this.formName() });
    req.subscribe(() => { this.formDialogOpen.set(false); this.load(this.page()?.current_page ?? 1); });
  }

  closeFormDialog(): void { this.formDialogOpen.set(false); }

  delete(item: Genre): void {
    this.openConfirm(
      this.t.translate('admin.genres.delete_title', { name: item.name[this.t.getActiveLang()] || item.name['en'] }),
      this.t.translate('admin.genres.delete_subtitle'),
      () => this.api.deleteGenre(item.id).subscribe(() => this.load(this.page()?.current_page ?? 1))
    );
  }

  openWeights(genre: Genre): void {
    this.weightGenreId.set(genre.id);
    this.weightsDialogTitle.set(this.t.translate('admin.genres.categories_title', { name: genre.name[this.t.getActiveLang()] || genre.name['en'] }));
    this.addingCategoryId.set(0);
    const lang = this.t.getActiveLang();
    this.assignedRows.set(
      (genre.categories ?? []).map(c => ({ id: c.id, name: c.name[lang] || c.name['en'], weight: c.pivot.weight }))
    );
    this.weightsDialogOpen.set(true);
  }

  addCategory(): void {
    const id = this.addingCategoryId();
    if (!id) return;
    const cat = this.allCategories().find(c => c.id === id);
    if (!cat) return;
    const lang = this.t.getActiveLang();
    this.openConfirm(
      this.t.translate('admin.genres.add_title', { name: cat.name[lang] || cat.name['en'] }),
      this.t.translate('admin.genres.add_subtitle'),
      () => {
        this.assignedRows.update(rows => [...rows, { id: cat.id, name: cat.name[lang] || cat.name['en'], weight: 0.5 }]);
        this.addingCategoryId.set(0);
      }
    );
  }

  removeCategory(id: number): void {
    const row = this.assignedRows().find(r => r.id === id);
    if (!row) return;
    this.openConfirm(
      this.t.translate('admin.genres.remove_title', { name: row.name }),
      this.t.translate('admin.genres.remove_subtitle'),
      () => this.assignedRows.update(rows => rows.filter(r => r.id !== id))
    );
  }

  updateWeight(index: number, value: number): void {
    const rows = [...this.assignedRows()];
    rows[index] = { ...rows[index], weight: value };
    this.assignedRows.set(rows);
  }

  saveWeights(): void {
    const id = this.weightGenreId()!;
    const categories = this.assignedRows().map(r => ({ id: r.id, weight: r.weight }));
    this.api.syncGenreCategories(id, categories).subscribe(() => {
      this.weightsDialogOpen.set(false);
      this.load(this.page()?.current_page ?? 1);
    });
  }

  closeWeightsDialog(): void { this.weightsDialogOpen.set(false); }

  openConfirm(title: string, subtitle: string, action: () => void): void {
    this.confirmDialogTitle.set(title);
    this.confirmDialogSubtitle.set(subtitle);
    this.pendingAction.set(action);
    this.confirmDialogOpen.set(true);
  }

  confirmAction(): void { this.pendingAction()?.(); this.closeConfirm(); }
  closeConfirm(): void { this.confirmDialogOpen.set(false); this.pendingAction.set(null); }

  goTo(p: number): void { this.load(p); }

  pages(): number[] {
    const last = this.page()?.last_page ?? 1;
    return Array.from({ length: last }, (_, i) => i + 1);
  }
}
