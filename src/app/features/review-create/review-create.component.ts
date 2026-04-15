import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ReviewFormData } from '../../core/models/product.model';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-review-create',
  standalone: true,
  imports: [TranslocoModule, BreadcrumbComponent],
  templateUrl: './review-create.component.html',
  styleUrl: './review-create.component.css',
})
export class ReviewCreateComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private t      = inject(TranslocoService);

  formData   = signal<ReviewFormData | null>(null);
  scores     = signal<Record<number, number>>({});
  body       = signal('');
  loading    = signal(true);
  submitting = signal(false);
  error      = signal(false);

  breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const p = this.formData();
    if (!p) return [];
    return [
      { labelKey: 'admin.types.' + p.type, link: '/product/' + p.type + '/' + p.slug },
      { label: p.title, link: '/product/' + p.type + '/' + p.slug },
      { labelKey: 'review.create_title' },
    ];
  });

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const productId = Number(this.route.snapshot.paramMap.get('productId'));
    this.api.getReviewForm(productId).subscribe({
      next: data => {
        this.formData.set(data);
        const initial: Record<number, number> = {};
        data.categories.forEach(c => initial[c.id] = 5);
        this.scores.set(initial);
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  setScore(categoryId: number, value: number): void {
    this.scores.update(s => ({ ...s, [categoryId]: value }));
  }

  categoryName(category: { name: Record<string, string> }): string {
    const lang = this.t.getActiveLang();
    return category.name[lang] || category.name['en'] || '—';
  }

  submit(): void {
    const data = this.formData();
    if (!data || this.submitting()) return;
    this.submitting.set(true);

    const scores = data.categories.map(c => ({
      category_id: c.id,
      score: this.scores()[c.id] ?? 5,
    }));

    this.api.submitReview({ product_id: data.id, body: this.body(), scores }).subscribe({
      next: () => this.router.navigate(['/product', data.type, data.slug]),
      error: () => this.submitting.set(false),
    });
  }
}
