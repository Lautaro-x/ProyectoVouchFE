import { Component, computed, inject, OnDestroy, OnInit, signal, PLATFORM_ID,
         ChangeDetectionStrategy, ViewChild, ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { TrailerProduct } from '../../../core/models/product.model';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { localizedValue } from '../../../core/utils/localized-value';

@Component({
  selector: 'app-trailers-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, SafeUrlPipe],
  templateUrl: './trailers-section.component.html',
  styleUrl: './trailers-section.component.css',
})
export class TrailersSectionComponent implements OnInit, OnDestroy {
  private readonly api         = inject(ApiService);
  private readonly platformId  = inject(PLATFORM_ID);
  private readonly translocoSvc = inject(TranslocoService);

  private readonly activeLang = toSignal(this.translocoSvc.langChanges$, {
    initialValue: this.translocoSvc.getActiveLang(),
  });

  readonly trailers         = signal<TrailerProduct[]>([]);
  readonly selectedTrailer  = signal<TrailerProduct | null>(null);
  readonly playerVisible    = signal(false);
  private readonly userSelected         = signal(false);
  private readonly trailerSectionTitle  = signal<Record<string, string> | null>(null);

  readonly trailersLeft  = computed(() => this.trailers().slice(0, 10));
  readonly trailersRight = computed(() => this.trailers().slice(10));

  readonly trailerTitle = computed(() => {
    const custom = this.trailerSectionTitle();
    return custom ? localizedValue(custom, this.activeLang()) : null;
  });

  readonly youtubeUrl = computed(() => {
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
    if (!isPlatformBrowser(this.platformId)) return;
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
