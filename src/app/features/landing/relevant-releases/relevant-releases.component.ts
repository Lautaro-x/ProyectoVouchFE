import { Component, inject, OnInit, signal, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { ProductCard } from '../../../core/models/product.model';
import { GameCardComponent } from '../../../shared/components/game-card/game-card.component';

@Component({
  selector: 'app-relevant-releases',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, GameCardComponent],
  templateUrl: './relevant-releases.component.html',
  styleUrl: './relevant-releases.component.css',
})
export class RelevantReleasesComponent implements OnInit {
  private readonly api        = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly products = signal<ProductCard[]>([]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.api.getRelevantProducts().subscribe(p => this.products.set(p));
  }
}
