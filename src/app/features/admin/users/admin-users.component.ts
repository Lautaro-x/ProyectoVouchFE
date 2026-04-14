import { Component, inject, OnInit, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { AdminUser, Paginated } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-admin-users',
  imports: [SlicePipe, TranslocoModule, DialogComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit {
  private api = inject(AdminApiService);
  private t   = inject(TranslocoService);

  page      = signal<Paginated<AdminUser> | null>(null);
  perPage   = signal(25);
  sortBy    = signal('id');
  sortDir   = signal<'asc' | 'desc'>('asc');
  filterSearch = signal('');
  filterBanned = signal(false);
  filterRole   = signal('');

  banDialogOpen  = signal(false);
  banDialogTitle = signal('');
  banningId      = signal<number | null>(null);
  banReason      = signal('');

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
    if (this.filterBanned()) params['banned'] = '1';
    if (this.filterRole()) params['role'] = this.filterRole();
    if (this.filterSearch()) params['search'] = this.filterSearch();
    this.api.getUsers(params).subscribe(data => this.page.set(data));
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

  startBan(user: AdminUser): void {
    this.banningId.set(user.id);
    this.banDialogTitle.set(
      this.t.translate('admin.users.ban_title', { name: user.name })
    );
    this.banReason.set('');
    this.banDialogOpen.set(true);
  }

  confirmBan(): void {
    const id = this.banningId()!;
    this.api.banUser(id, this.banReason()).subscribe(() => {
      this.banDialogOpen.set(false);
      this.load(this.page()?.current_page ?? 1);
    });
  }

  closeBanDialog(): void { this.banDialogOpen.set(false); }

  unban(user: AdminUser): void {
    this.openConfirm(
      this.t.translate('admin.users.unban_title', { name: user.name }),
      this.t.translate('admin.users.unban_subtitle'),
      () => this.api.unbanUser(user.id).subscribe(() => this.load(this.page()?.current_page ?? 1))
    );
  }

  changeRole(id: number, role: string): void {
    this.api.updateUserRole(id, role).subscribe(() => this.load(this.page()?.current_page ?? 1));
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
