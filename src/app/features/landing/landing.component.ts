import { Component, computed, inject, OnDestroy, OnInit, signal, PLATFORM_ID,
         ChangeDetectionStrategy, ViewChild, ElementRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { ProductCard, TrailerProduct } from '../../core/models/product.model';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { localizedValue } from '../../core/utils/localized-value';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, GameCardComponent, SafeUrlPipe],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit, OnDestroy {
  private readonly api         = inject(ApiService);
  private readonly platformId  = inject(PLATFORM_ID);
  private readonly meta        = inject(Meta);
  private readonly titleSvc    = inject(Title);
  private readonly translocoSvc = inject(TranslocoService);

  private readonly activeLang = toSignal(this.translocoSvc.langChanges$, {
    initialValue: this.translocoSvc.getActiveLang(),
  });

  relevantProducts    = signal<ProductCard[]>([]);
  trailers            = signal<TrailerProduct[]>([]);
  selectedTrailer     = signal<TrailerProduct | null>(null);
  playerVisible       = signal(false);
  private userSelected = signal(false);
  private trailerSectionTitle = signal<Record<string, string> | null>(null);

  trailersLeft  = computed(() => this.trailers().slice(0, 10));
  trailersRight = computed(() => this.trailers().slice(10));

  trailerTitle = computed(() => {
    const custom = this.trailerSectionTitle();
    return custom ? localizedValue(custom, this.activeLang()) : null;
  });

  youtubeUrl = computed(() => {
    const t = this.selectedTrailer();
    if (!t) return null;
    const params = this.userSelected() ? 'autoplay=1' : 'mute=1';
    return `https://www.youtube.com/embed/${t.trailer_youtube_id}?${params}`;
  });

  private observer?: IntersectionObserver;

  @ViewChild('trailerSection') set trailerSectionRef(el: ElementRef | undefined) {
    if (el && isPlatformBrowser(this.platformId) && !this.observer) {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.playerVisible.set(true);
            this.observer?.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      this.observer.observe(el.nativeElement);
    }
  }

  ngOnInit(): void {
    const desc = 'Plataforma social de críticas ponderadas para videojuegos.';
    this.titleSvc.setTitle('Vouch — Críticas ponderadas de videojuegos');
    this.meta.updateTag({ name: 'description',         content: desc });
    this.meta.updateTag({ property: 'og:type',         content: 'website' });
    this.meta.updateTag({ property: 'og:title',        content: 'Vouch — Críticas ponderadas de videojuegos' });
    this.meta.updateTag({ property: 'og:description',  content: desc });
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: 'Vouch — Críticas ponderadas de videojuegos' });
    this.meta.updateTag({ name: 'twitter:description', content: desc });

    if (!isPlatformBrowser(this.platformId)) return;
    this.api.getRelevantProducts().subscribe(p => this.relevantProducts.set(p));
    this.api.getLatestTrailers().subscribe(r => {
      this.trailerSectionTitle.set(r.section_title);
      this.trailers.set(r.items);
      if (r.items.length) this.selectedTrailer.set(r.items[0]);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  selectTrailer(trailer: TrailerProduct): void {
    this.userSelected.set(true);
    this.selectedTrailer.set(trailer);
  }
}
