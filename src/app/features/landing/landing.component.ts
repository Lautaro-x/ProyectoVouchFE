import { Component, inject, OnInit, signal, PLATFORM_ID, ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { ProductCard } from '../../core/models/product.model';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, GameCardComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit {
  private readonly api        = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly meta       = inject(Meta);
  private readonly titleSvc   = inject(Title);

  relevantProducts = signal<ProductCard[]>([]);

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
  }
}
