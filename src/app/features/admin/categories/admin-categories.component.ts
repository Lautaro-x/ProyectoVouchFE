import { Component, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { Category, Paginated, TranslatableName } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { LocalizedNamePipe } from '../pipes/localized-name.pipe';

const EMPTY_NAME = (): TranslatableName => ({ en: '', es: '', fr: '', pt: '', it: '' });
const EMPTY_DESC = (): TranslatableName => ({ en: '', es: '', fr: '', pt: '', it: '' });

@Component({
  selector: 'app-admin-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, DialogComponent, LocalizedNamePipe],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css',
})
export class AdminCategoriesComponent implements OnInit {
  private api = inject(AdminApiService);
  private t   = inject(TranslocoService);

  readonly locales = [
    { code: 'en', label: 'English (EN) *' },
    { code: 'es', label: 'Español (ES)' },
    { code: 'fr', label: 'Français (FR)' },
    { code: 'pt', label: 'Português (PT)' },
    { code: 'it', label: 'Italiano (IT)' },
  ];

  page      = signal<Paginated<Category> | null>(null);
  perPage   = signal(25);
  sortBy    = signal('id');
  sortDir   = signal<'asc' | 'desc'>('asc');
  filterSearch = signal('');

  formDialogOpen  = signal(false);
  formDialogTitle = signal('');
  editingId       = signal<number | null>(null);
  formName        = signal<TranslatableName>(EMPTY_NAME());
  formDesc        = signal<TranslatableName>(EMPTY_DESC());
  descLang        = signal('en');

  confirmDialogOpen     = signal(false);
  confirmDialogTitle    = signal('');
  confirmDialogSubtitle = signal('');
  private pendingAction = signal<(() => void) | null>(null);

  ngOnInit(): void { this.load(); }

  load(p = 1): void {
    const params: Record<string, string> = {
      page: String(p),
      per_page: String(this.perPage()),
      sort_by: this.sortBy(),
      sort_dir: this.sortDir(),
    };
    if (this.filterSearch()) params['search'] = this.filterSearch();
    this.api.getCategories(params).subscribe(data => this.page.set(data));
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

  updateFormDesc(value: string): void {
    const lang = this.descLang();
    this.formDesc.update(d => ({ ...d, [lang]: value }));
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formName.set(EMPTY_NAME());
    this.formDesc.set(EMPTY_DESC());
    this.descLang.set(this.t.getActiveLang());
    this.formDialogTitle.set(this.t.translate('admin.categories.new_title'));
    this.formDialogOpen.set(true);
  }

  openEdit(item: Category): void {
    this.editingId.set(item.id);
    this.formName.set({ ...EMPTY_NAME(), ...item.name });
    this.formDesc.set({ ...EMPTY_DESC(), ...(item.description ?? {}) });
    this.descLang.set(this.t.getActiveLang());
    this.formDialogTitle.set(this.t.translate('admin.categories.edit_title', { name: item.name[this.t.getActiveLang()] || item.name['en'] }));
    this.formDialogOpen.set(true);
  }

  save(): void {
    if (!this.formName()['en']?.trim()) return;
    const id = this.editingId();
    const payload = { name: this.formName(), description: this.formDesc() };
    const req = id
      ? this.api.updateCategory(id, payload)
      : this.api.createCategory(payload);
    req.subscribe(() => { this.formDialogOpen.set(false); this.load(this.page()?.current_page ?? 1); });
  }

  closeFormDialog(): void { this.formDialogOpen.set(false); }

  delete(item: Category): void {
    this.openConfirm(
      this.t.translate('admin.categories.delete_title', { name: item.name[this.t.getActiveLang()] || item.name['en'] }),
      this.t.translate('admin.common.irreversible'),
      () => this.api.deleteCategory(item.id).subscribe(() => this.load(this.page()?.current_page ?? 1))
    );
  }

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
