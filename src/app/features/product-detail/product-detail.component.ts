import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { ProductDetail } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [TranslocoModule, RouterLink, DatePipe, BreadcrumbComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private api    = inject(ApiService);
  private t      = inject(TranslocoService);
  readonly auth  = inject(AuthService);

  product = signal<ProductDetail | null>(null);
  loading = signal(true);
  error   = signal(false);

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
      next:  p  => { this.product.set(p); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
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
