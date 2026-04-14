import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { Paginated, Platform } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-admin-platforms',
  imports: [TranslocoModule, DialogComponent],
  templateUrl: './admin-platforms.component.html',
  styleUrl: './admin-platforms.component.css',
})
export class AdminPlatformsComponent implements OnInit {
  private api = inject(AdminApiService);
  private t   = inject(TranslocoService);

  page    = signal<Paginated<Platform> | null>(null);
  perPage = signal(25);
  sortBy  = signal('id');
  sortDir = signal<'asc' | 'desc'>('asc');
  filterSearch = signal('');
  filterType   = signal('');

  formDialogOpen  = signal(false);
  formDialogTitle = signal('');
  editingId       = signal<number | null>(null);
  formName        = signal('');
  formType        = signal<'console' | 'pc' | 'streaming'>('console');

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
    if (this.filterType()) params['type'] = this.filterType();
    this.api.getPlatforms(params).subscribe(data => this.page.set(data));
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

  openCreate(): void {
    this.editingId.set(null);
    this.formName.set('');
    this.formType.set('console');
    this.formDialogTitle.set(this.t.translate('admin.platforms.new_title'));
    this.formDialogOpen.set(true);
  }

  openEdit(item: Platform): void {
    this.editingId.set(item.id);
    this.formName.set(item.name);
    this.formType.set(item.type);
    this.formDialogTitle.set(this.t.translate('admin.platforms.edit_title', { name: item.name }));
    this.formDialogOpen.set(true);
  }

  save(): void {
    const id = this.editingId();
    const payload = { name: this.formName(), type: this.formType() };
    const req = id
      ? this.api.updatePlatform(id, payload)
      : this.api.createPlatform(payload);

    req.subscribe(() => { this.formDialogOpen.set(false); this.load(this.page()?.current_page ?? 1); });
  }

  closeFormDialog(): void { this.formDialogOpen.set(false); }

  delete(item: Platform): void {
    this.openConfirm(
      this.t.translate('admin.platforms.delete_title', { name: item.name }),
      this.t.translate('admin.common.irreversible'),
      () => this.api.deletePlatform(item.id).subscribe(() => this.load(this.page()?.current_page ?? 1))
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
