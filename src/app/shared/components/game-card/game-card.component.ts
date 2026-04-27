import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ProductCard } from '../../../core/models/product.model';
import { IgdbCoverPipe } from '../../pipes/igdb-cover.pipe';

@Component({
  selector: 'app-game-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule, RouterLink, IgdbCoverPipe],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.css',
})
export class GameCardComponent {
  product = input.required<ProductCard>();

  gradeClass = computed(() => {
    const g = this.product().letter_grade;
    return g ? g.replace('+', 'plus').replace('-', 'minus').toLowerCase() : '';
  });

  trustGradeClass = computed(() => {
    const g = this.product().trust_grade;
    return g ? g.replace('+', 'plus').replace('-', 'minus').toLowerCase() : '';
  });

  detailLink = computed(() => ['/product', this.product().type, this.product().slug]);

  followerGradeClass = computed(() => {
    const g = this.product().follower_review?.letter_grade;
    return g ? g.replace('+', 'plus').replace('-', 'minus').toLowerCase() : '';
  });
}
