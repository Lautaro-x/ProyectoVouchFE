import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ProductCard } from '../../../core/models/product.model';
import { IgdbCoverPipe } from '../../pipes/igdb-cover.pipe';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [TranslocoModule, RouterLink, IgdbCoverPipe],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.css',
})
export class GameCardComponent {
  product = input.required<ProductCard>();

  gradeClass = computed(() =>
    this.product().letter_grade.replace('+', 'plus').replace('-', 'minus').toLowerCase()
  );

  detailLink = computed(() => ['/product', this.product().type, this.product().slug]);
}
