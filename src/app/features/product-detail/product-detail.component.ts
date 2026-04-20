import { Component, computed, inject, OnDestroy, OnInit, signal, ChangeDetectionStrategy, PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { ProductDetail, ProductReview } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, RouterLink, DatePipe, BreadcrumbComponent, SafeUrlPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private readonly route      = inject(ActivatedRoute);
  private readonly api        = inject(ApiService);
  private readonly t          = inject(TranslocoService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly auth               = inject(AuthService);

  product  = signal<ProductDetail | null>(null);
  loading  = signal(true);
  error    = signal(false);
  activeTab = signal<'presentation' | 'data' | 'characteristics'>('presentation');

  reviews          = signal<ProductReview[]>([]);
  reviewsPage      = signal(0);
  reviewsHasMore   = signal(false);
  reviewsLoading   = signal(false);
  expandedIds      = signal(new Set<number>());
  brokenAvatarIds  = signal(new Set<number>());

  private observer: IntersectionObserver | null = null;

  breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const p = this.product();
    if (!p) return [];
    return [
      { labelKey: 'admin.types.' + p.type, link: p.type === 'game' ? '/games' : undefined },
      { label: p.title },
    ];
  });

  ngOnInit(): void {
    const type = this.route.snapshot.paramMap.get('type')!;
    const slug = this.route.snapshot.paramMap.get('slug')!;

    this.api.getProduct(type, slug).subscribe({
      next: p => {
        this.product.set(p);
        this.loading.set(false);
        this.loadReviews(p.id, 1, true);
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private loadReviews(productId: number, page: number, initial: boolean): void {
    this.reviewsLoading.set(true);
    this.api.getProductReviews(productId, page).subscribe(res => {
      this.reviews.update(prev => initial ? res.data : [...prev, ...res.data]);
      this.reviewsPage.set(res.current_page);
      this.reviewsHasMore.set(res.current_page < res.last_page);
      this.reviewsLoading.set(false);
      if (initial) setTimeout(() => this.setupObserver(), 0);
    });
  }

  loadMoreReviews(): void {
    const p = this.product();
    if (!p || this.reviewsLoading() || !this.reviewsHasMore()) return;
    this.loadReviews(p.id, this.reviewsPage() + 1, false);
  }

  private setupObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const sentinel = document.getElementById('reviews-sentinel');
    if (!sentinel) return;
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) this.loadMoreReviews();
    }, { rootMargin: '300px' });
    this.observer.observe(sentinel);
  }

  toggleExpand(id: number): void {
    const s = new Set(this.expandedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.expandedIds.set(s);
  }

  isExpanded(id: number): boolean {
    return this.expandedIds().has(id);
  }

  onReviewAvatarError(userId: number): void {
    const s = new Set(this.brokenAvatarIds());
    s.add(userId);
    this.brokenAvatarIds.set(s);
  }

  isAvatarBroken(userId: number): boolean {
    return this.brokenAvatarIds().has(userId);
  }

  needsExpand(body: string | null): boolean {
    return (body?.length ?? 0) > 220;
  }

  gradeClass(grade: string | null): string {
    if (!grade) return '';
    return 'grade-' + grade.replace('+', 'plus').replace('-', 'minus').toLowerCase();
  }

  genreNames(): string {
    const lang = this.t.getActiveLang();
    return this.product()?.genres.map(g => g.name[lang] || g.name['en']).join(', ') || '—';
  }
}
