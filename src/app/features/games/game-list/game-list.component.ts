import { Component, computed, inject, DestroyRef, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { ProductCard } from '../../../core/models/product.model';
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
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(value => {
      this.searchInput.set(value);
      this.page.set(1);
      this.load();
    });

    this.load();
  }

  onSearchInput(value: string): void {
    this.search$.next(value);
  }

  goToPage(p: number | '…'): void {
    if (p === '…' || p === this.page()) return;
    this.page.set(p);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.api.getGames(this.searchInput(), this.page()).subscribe({
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
