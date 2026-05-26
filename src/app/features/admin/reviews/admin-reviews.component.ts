import { Component, DestroyRef, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AdminApiService } from '../services/admin-api.service';
import { AdminReview } from '../models/admin.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { AdminTableBase } from '../admin-table.base';

@Component({
  selector: 'app-admin-reviews',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe, RouterLink, TranslocoModule, DialogComponent],
  templateUrl: './admin-reviews.component.html',
  styleUrl: './admin-reviews.component.css',
})
export class AdminReviewsComponent extends AdminTableBase<AdminReview> implements OnInit {
  private api        = inject(AdminApiService);
  private t          = inject(TranslocoService);
  private destroyRef = inject(DestroyRef);

  bannedOnly = signal(false);

  banDialogOpen  = signal(false);
  banDialogTitle = signal('');
  banningId      = signal<number | null>(null);
  banReason      = signal('');

  reviewDialogOpen  = signal(false);
  reviewDialogTitle = signal('');
  reviewingId       = signal<number | null>(null);
  reviewBody        = signal('');

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
    this.api.getReviews(params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => this.page.set(data));
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
    this.api.banReview(id, this.banReason()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.banDialogOpen.set(false);
      this.load(this.page()?.current_page ?? 1);
    });
  }

  closeBanDialog(): void { this.banDialogOpen.set(false); }

  openReviewDialog(review: AdminReview): void {
    this.reviewingId.set(review.id);
    this.reviewDialogTitle.set(
      this.t.translate('admin.reviews.review_title', { id: review.id, user: review.user?.name ?? review.user_id })
    );
    this.reviewBody.set(review.body ?? '');
    this.reviewDialogOpen.set(true);
  }

  saveReview(): void {
    const id = this.reviewingId()!;
    const body = this.reviewBody().trim() || null;
    this.api.updateReviewBody(id, body).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(updated => {
      this.page.update(p => p ? {
        ...p,
        data: p.data.map(r => r.id === id ? { ...r, body: updated.body } : r),
      } : p);
      this.reviewDialogOpen.set(false);
    });
  }

  closeReviewDialog(): void { this.reviewDialogOpen.set(false); }

  unban(review: AdminReview): void {
    this.openConfirm(
      this.t.translate('admin.reviews.unban_title', { id: review.id }),
      this.t.translate('admin.reviews.unban_subtitle', {
        user: review.user?.name ?? review.user_id,
        product: review.product?.title ?? review.product_id,
      }),
      () => this.api.unbanReview(review.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load(this.page()?.current_page ?? 1))
    );
  }
}
