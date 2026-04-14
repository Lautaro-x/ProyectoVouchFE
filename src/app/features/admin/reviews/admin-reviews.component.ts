import { Component, inject, OnInit, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { AdminReview, Paginated } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-admin-reviews',
  imports: [SlicePipe, TranslocoModule, DialogComponent],
  templateUrl: './admin-reviews.component.html',
  styleUrl: './admin-reviews.component.css',
})
export class AdminReviewsComponent implements OnInit {
  private api = inject(AdminApiService);
  private t   = inject(TranslocoService);

  page         = signal<Paginated<AdminReview> | null>(null);
  perPage      = signal(25);
  sortBy       = signal('id');
  sortDir      = signal<'asc' | 'desc'>('asc');
  bannedOnly   = signal(false);
  filterSearch = signal('');

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
    if (this.bannedOnly()) params['banned'] = '1';
    if (this.filterSearch()) params['search'] = this.filterSearch();
    this.api.getReviews(params).subscribe(data => this.page.set(data));
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

  toggleBannedFilter(): void { this.bannedOnly.update(v => !v); this.load(); }

  startBan(review: AdminReview): void {
    this.banningId.set(review.id);
    this.banDialogTitle.set(
      this.t.translate('admin.reviews.ban_title', { name: `#${review.id} — ${review.user?.name ?? review.user_id}` })
    );
    this.banReason.set('');
    this.banDialogOpen.set(true);
  }

  confirmBan(): void {
    const id = this.banningId()!;
    this.api.banReview(id, this.banReason()).subscribe(() => {
      this.banDialogOpen.set(false);
      this.load(this.page()?.current_page ?? 1);
    });
  }

  closeBanDialog(): void { this.banDialogOpen.set(false); }

  unban(review: AdminReview): void {
    this.openConfirm(
      this.t.translate('admin.reviews.unban_title', { id: review.id }),
      this.t.translate('admin.reviews.unban_subtitle', {
        user: review.user?.name ?? review.user_id,
        product: review.product?.title ?? review.product_id,
      }),
      () => this.api.unbanReview(review.id).subscribe(() => this.load(this.page()?.current_page ?? 1))
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
