import { Component, inject, OnInit, signal } from '@angular/core';
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
  private api = inject(ApiService);

  relevantProducts = signal<ProductCard[]>([]);

  ngOnInit(): void {
    this.api.getRelevantProducts().subscribe(p => this.relevantProducts.set(p));
  }
}
