import { Component, computed, inject, DestroyRef, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { IgdbSuggestion, ProductCard } from '../../../core/models/product.model';
import { GameCardComponent } from '../../../shared/components/game-card/game-card.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-game-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, GameCardComponent, BreadcrumbComponent],
  templateUrl: './game-list.component.html',
  styleUrl: './game-list.component.css',
})
export class GameListComponent implements OnInit {
  private api        = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private meta       = inject(Meta);
  private titleSvc   = inject(Title);
  private search$    = new Subject<string>();

  readonly breadcrumbs: BreadcrumbItem[] = [
    { labelKey: 'games.title' },
  ];

  games       = signal<ProductCard[]>([]);
  loading     = signal(true);
  searchInput = signal('');
  page        = signal(1);
  lastPage    = signal(1);
  total       = signal(0);
  filterType  = signal('');
  filterValue = signal('');
  filterLabel = signal('');

  discoverSuggestions = signal<IgdbSuggestion[]>([]);
  discoverSearched    = signal(false);
  discoverLoading     = signal(false);
  importing           = signal<number | null>(null);

  filterTypeKey = computed(() => {
    const t = this.filterType();
    return t ? 'games.filter_type_' + t : '';
  });

  pageNumbers = computed<(number | '…')[]>(() => {
    const last    = this.lastPage();
    const current = this.page();

    if (last <= 7) {
      return Array.from({ length: last }, (_, i) => i + 1);
    }

    const pages: (number | '…')[] = [1];
    if (current > 3) pages.push('…');
    for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < last - 2) pages.push('…');
    pages.push(last);
    return pages;
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const ft = params.get('filterType') ?? '';
        const fv = params.get('filterValue') ?? '';
        const fl = fv.replace(/-/g, ' ');
        this.filterType.set(ft);
        this.filterValue.set(fv);
        this.filterLabel.set(fl);
        this.searchInput.set('');
        this.page.set(1);
        this.setOgTags(fl || fv);
        this.load();
      });

    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(value => {
      this.searchInput.set(value);
      this.page.set(1);
      this.resetDiscover();
      this.load();
    });
  }

  onSearchInput(value: string): void {
    this.search$.next(value);
  }

  goToPage(p: number | '…'): void {
    if (p === '…' || p === this.page()) return;
    this.page.set(p);
    this.load();
  }

  clearFilter(): void {
    this.filterType.set('');
    this.filterValue.set('');
    this.filterLabel.set('');
    this.router.navigate(['/games']);
  }

  discover(): void {
    if (this.searchInput().length < 3) return;
    this.discoverLoading.set(true);
    this.discoverSearched.set(true);
    this.api.discoverIgdb(this.searchInput()).subscribe({
      next: results => {
        this.discoverSuggestions.set(results);
        this.discoverLoading.set(false);
      },
      error: () => this.discoverLoading.set(false),
    });
  }

  importSuggestion(igdbId: number): void {
    if (this.importing() !== null) return;
    this.importing.set(igdbId);
    this.api.importDiscovered(igdbId).subscribe({
      next: ({ type, slug }) => this.router.navigate(['/product', type, slug]),
      error: () => this.importing.set(null),
    });
  }

  private resetDiscover(): void {
    this.discoverSearched.set(false);
    this.discoverSuggestions.set([]);
    this.discoverLoading.set(false);
    this.importing.set(null);
  }

  private setOgTags(filterLabel: string): void {
    const pageTitle = filterLabel ? `${filterLabel} games — Vouch` : 'Games — Vouch';
    const desc      = 'Explore and discover video games with weighted reviews on Vouch.';
    this.titleSvc.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description',         content: desc });
    this.meta.updateTag({ property: 'og:type',         content: 'website' });
    this.meta.updateTag({ property: 'og:title',        content: pageTitle });
    this.meta.updateTag({ property: 'og:description',  content: desc });
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
  }

  private load(): void {
    this.loading.set(true);
    const ft = this.filterType() || undefined;
    const fv = this.filterValue() || undefined;
    this.api.getGames(this.searchInput(), this.page(), ft, fv).subscribe({
      next: res => {
        this.games.set(res.data);
        this.lastPage.set(res.last_page);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
