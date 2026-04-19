import { Component, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { AdminUser } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { AdminTableBase } from '../admin-table.base';

@Component({
  selector: 'app-admin-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe, RouterLink, TranslocoModule, DialogComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent extends AdminTableBase<AdminUser> implements OnInit {
  private api = inject(AdminApiService);
  private t   = inject(TranslocoService);

  filterBanned = signal(false);
  filterRole   = signal('');

  banDialogOpen  = signal(false);
  banDialogTitle = signal('');
  banningId      = signal<number | null>(null);
  banReason      = signal('');

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

  startBan(user: AdminUser): void {
    this.banningId.set(user.id);
    this.banDialogTitle.set(this.t.translate('admin.users.ban_title', { name: user.name }));
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

  toggleVerified(user: AdminUser): void {
    const isVerified = user.badges?.includes('verificado') ?? false;
    const req = isVerified ? this.api.revokeVerified(user.id) : this.api.grantVerified(user.id);
    req.subscribe(res => {
      this.page.update(p => p ? {
        ...p,
        data: p.data.map(u => u.id === user.id ? { ...u, badges: res.badges } : u),
      } : p);
    });
  }
}
