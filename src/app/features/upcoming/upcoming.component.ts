import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { HeroGame, UpcomingGame } from '../../core/models/product.model';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { UpcomingHeroComponent } from '../../shared/components/upcoming-hero/upcoming-hero.component';

@Component({
  selector: 'app-upcoming',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, BreadcrumbComponent, UpcomingHeroComponent],
  templateUrl: './upcoming.component.html',
  styleUrl: './upcoming.component.css',
})
export class UpcomingComponent implements OnInit {
  private api = inject(ApiService);
  private t   = inject(TranslocoService);

  readonly breadcrumbs: BreadcrumbItem[] = [{ labelKey: 'upcoming.title' }];

  games   = signal<UpcomingGame[]>([]);
  loading = signal(true);

  private readonly topGame = computed(() => {
    const list = this.games().filter(g => g.cover_image);
    if (!list.length) return this.games()[0] ?? null;
    return list.reduce((best, g) => (g.hypes ?? 0) > (best.hypes ?? 0) ? g : best, list[0]);
  });

  hero = computed((): HeroGame | null => {
    const g = this.topGame();
    if (!g) return null;
    return {
      title: g.title,
      cover_image: g.cover_image,
      developer: g.developer,
      badge_type: 'anticipated',
      letter_grade: null,
      release_date: g.release_date,
      official_url: g.official_url,
      trailer_youtube_id: g.trailer_youtube_id,
      product_slug: null,
      product_type: null,
    };
  });

  soon = computed(() => {
    const now    = Date.now();
    const in30   = now + 30 * 86400000;
    const heroId = this.topGame()?.igdb_id;
    return this.games()
      .filter(g => {
        if (!g.release_date || g.igdb_id === heroId) return false;
        const ts = this.parseDate(g.release_date);
        return ts > now && ts <= in30;
      })
      .sort((a, b) => this.parseDate(a.release_date!) - this.parseDate(b.release_date!));
  });

  later = computed(() => {
    const in30   = Date.now() + 30 * 86400000;
    const heroId = this.topGame()?.igdb_id;
    return this.games()
      .filter(g => {
        if (!g.release_date || g.igdb_id === heroId) return false;
        return this.parseDate(g.release_date) > in30;
      })
      .sort((a, b) => this.parseDate(a.release_date!) - this.parseDate(b.release_date!))
      .slice(0, 24);
  });

  noDate = computed(() =>
    this.games().filter(g => !g.release_date)
  );

  private parseDate(dateStr: string): number {
    return new Date(dateStr.substring(0, 10) + 'T12:00:00').getTime();
  }

  daysUntil(dateStr: string | null): number {
    if (!dateStr) return Infinity;
    const d = new Date(dateStr.substring(0, 10) + 'T12:00:00');
    if (isNaN(d.getTime())) return Infinity;
    return Math.ceil((d.getTime() - Date.now()) / 86400000);
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr.substring(0, 10) + 'T12:00:00');
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(this.t.getActiveLang(), { month: 'long', day: 'numeric', year: 'numeric' }).format(d);
  }

  openTrailer(game: UpcomingGame): void {
    if (!game.trailer_youtube_id) return;
    window.open(`https://www.youtube.com/watch?v=${game.trailer_youtube_id}`, '_blank', 'noopener');
  }

  ngOnInit(): void {
    this.api.getUpcomingGames().subscribe({
      next: games => { this.games.set(games); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
