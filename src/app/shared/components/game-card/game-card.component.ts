import { Component, computed, HostListener, inject, input, PLATFORM_ID, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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

  private readonly platformId = inject(PLATFORM_ID);

  readonly hovered      = signal(false);
  readonly screenWidth  = signal(isPlatformBrowser(this.platformId) ? window.innerWidth : 1200);

  @HostListener('window:resize')
  onResize(): void { this.screenWidth.set(window.innerWidth); }

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

  truncateName(name: string): string {
    const limit = this.screenWidth() <= 1024 ? 7 : 15;
    return name.length > limit ? name.slice(0, limit) + '…' : name;
  }

  @HostListener('mouseenter') onMouseEnter(): void { this.hovered.set(true); }
  @HostListener('mouseleave') onMouseLeave(): void { this.hovered.set(false); }
}
