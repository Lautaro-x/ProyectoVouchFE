import { Component, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { AdminReview } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { AdminTableBase } from '../admin-table.base';

@Component({
  selector: 'app-admin-reviews',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe, TranslocoModule, DialogComponent],
  templateUrl: './admin-reviews.component.html',
  styleUrl: './admin-reviews.component.css',
})
export class AdminReviewsComponent extends AdminTableBase<AdminReview> implements OnInit {
  private api = inject(AdminApiService);
  private t   = inject(TranslocoService);

  bannedOnly = signal(false);

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
    if (this.bannedOnly()) params['banned'] = '1';
    if (this.filterSearch()) params['search'] = this.filterSearch();
    this.api.getReviews(params).subscribe(data => this.page.set(data));
  }

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
}
