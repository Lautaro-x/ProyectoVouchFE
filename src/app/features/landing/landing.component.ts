import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../core/services/api.service';
import { ProductCard } from '../../core/models/product.model';
import { GameCardComponent } from '../../shared/components/game-card/game-card.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [TranslocoModule, GameCardComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit {
  private readonly api        = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);

  relevantProducts = signal<ProductCard[]>([]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.api.getRelevantProducts().subscribe(p => this.relevantProducts.set(p));
  }
}
